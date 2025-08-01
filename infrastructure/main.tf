terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  backend "s3" {
    # Configure your S3 backend
    # bucket = "your-terraform-state-bucket"
    # key    = "invoice-saas/terraform.tfstate"
    # region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random password for RDS
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# VPC and networking
module "vpc" {
  source = "./modules/vpc"

  project_name        = var.project_name
  environment        = var.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
  
  tags = local.common_tags
}

# Security groups
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  
  tags = local.common_tags
}

# RDS PostgreSQL
module "database" {
  source = "./modules/database"

  project_name          = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  db_security_group_id = module.security_groups.db_security_group_id
  db_password          = random_password.db_password.result
  
  tags = local.common_tags
}

# ElastiCache Redis
module "cache" {
  source = "./modules/cache"

  project_name             = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  cache_security_group_id = module.security_groups.cache_security_group_id
  
  tags = local.common_tags
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  
  tags = local.common_tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  project_name       = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_security_group_id
  certificate_arn   = module.ssl.certificate_arn
  
  tags = local.common_tags
}

# SSL Certificate
module "ssl" {
  source = "./modules/ssl"

  domain_name = var.domain_name
  
  tags = local.common_tags
}

# ECS Services
module "backend_service" {
  source = "./modules/ecs-service"

  project_name           = var.project_name
  environment           = var.environment
  service_name          = "backend"
  cluster_id            = module.ecs.cluster_id
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  app_security_group_id = module.security_groups.app_security_group_id
  target_group_arn      = module.alb.backend_target_group_arn
  
  # Environment variables
  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "DATABASE_URL"
      value = "postgresql://${module.database.db_username}:${random_password.db_password.result}@${module.database.db_endpoint}:5432/${module.database.db_name}"
    },
    {
      name  = "REDIS_URL"
      value = "redis://${module.cache.redis_endpoint}:6379"
    }
  ]

  # Secrets from Parameter Store
  secrets = [
    {
      name      = "JWT_SECRET"
      valueFrom = aws_ssm_parameter.jwt_secret.arn
    },
    {
      name      = "STRIPE_SECRET_KEY"
      valueFrom = aws_ssm_parameter.stripe_secret.arn
    }
  ]
  
  tags = local.common_tags
}

module "frontend_service" {
  source = "./modules/ecs-service"

  project_name           = var.project_name
  environment           = var.environment
  service_name          = "frontend"
  cluster_id            = module.ecs.cluster_id
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  app_security_group_id = module.security_groups.app_security_group_id
  target_group_arn      = module.alb.frontend_target_group_arn
  
  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "NEXT_PUBLIC_API_URL"
      value = "https://${var.domain_name}/api"
    }
  ]

  secrets = [
    {
      name      = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
      valueFrom = aws_ssm_parameter.stripe_publishable.arn
    }
  ]
  
  tags = local.common_tags
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  for_each = toset(["backend", "frontend"])
  
  name              = "/aws/ecs/${var.project_name}-${var.environment}-${each.key}"
  retention_in_days = 30
  
  tags = local.common_tags
}

# Parameter Store secrets
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/${var.environment}/JWT_SECRET"
  type  = "SecureString"
  value = "change-me-in-production"
  
  tags = local.common_tags
}

resource "aws_ssm_parameter" "stripe_secret" {
  name  = "/${var.project_name}/${var.environment}/STRIPE_SECRET_KEY"
  type  = "SecureString"
  value = "sk_test_change_me"
  
  tags = local.common_tags
}

resource "aws_ssm_parameter" "stripe_publishable" {
  name  = "/${var.project_name}/${var.environment}/STRIPE_PUBLISHABLE_KEY"
  type  = "SecureString"
  value = "pk_test_change_me"
  
  tags = local.common_tags
}

# S3 bucket for file uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-${var.environment}-uploads"
  
  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront for static assets
module "cdn" {
  source = "./modules/cloudfront"

  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.domain_name
  s3_bucket_id    = aws_s3_bucket.uploads.id
  certificate_arn = module.ssl.certificate_arn
  
  tags = local.common_tags
}

# Monitoring and alerting
module "monitoring" {
  source = "./modules/monitoring"

  project_name     = var.project_name
  environment      = var.environment
  alb_arn_suffix   = module.alb.alb_arn_suffix
  target_group_arn_suffixes = {
    backend  = module.alb.backend_target_group_arn_suffix
    frontend = module.alb.frontend_target_group_arn_suffix
  }
  
  tags = local.common_tags
}

# Local values
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}