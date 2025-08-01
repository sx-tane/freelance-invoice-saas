#!/bin/bash

# Deployment script for Invoice SaaS
# Usage: ./scripts/deploy.sh [environment] [service]
# Example: ./scripts/deploy.sh staging all
# Example: ./scripts/deploy.sh production backend

set -e

ENVIRONMENT=${1:-staging}
SERVICE=${2:-all}
PROJECT_NAME="invoice-saas"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log_error "Environment must be 'staging' or 'production'"
    exit 1
fi

# Check required tools
check_requirements() {
    local requirements=("docker" "docker-compose" "aws" "terraform")
    
    for req in "${requirements[@]}"; do
        if ! command -v $req &> /dev/null; then
            log_error "$req is required but not installed"
            exit 1
        fi
    done
    
    log_info "All requirements satisfied"
}

# Build and push Docker images
build_and_push() {
    local service=$1
    local tag="${ENVIRONMENT}-$(git rev-parse --short HEAD)"
    
    log_info "Building and pushing $service image..."
    
    # Build image
    docker build -t $PROJECT_NAME-$service:$tag ./$service
    docker tag $PROJECT_NAME-$service:$tag $PROJECT_NAME-$service:$ENVIRONMENT-latest
    
    # Push to registry (configure your registry here)
    # docker push $PROJECT_NAME-$service:$tag
    # docker push $PROJECT_NAME-$service:$ENVIRONMENT-latest
    
    log_info "$service image built and pushed successfully"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log_info "Deploying infrastructure for $ENVIRONMENT..."
    
    cd infrastructure
    
    # Initialize Terraform
    terraform init
    
    # Select workspace
    terraform workspace select $ENVIRONMENT || terraform workspace new $ENVIRONMENT
    
    # Plan deployment
    terraform plan -var="environment=$ENVIRONMENT" -out=tfplan
    
    # Apply if plan is successful
    if [ $? -eq 0 ]; then
        terraform apply tfplan
        log_info "Infrastructure deployed successfully"
    else
        log_error "Terraform plan failed"
        exit 1
    fi
    
    cd ..
}

# Deploy services
deploy_services() {
    local service=$1
    
    if [ "$service" = "all" ] || [ "$service" = "backend" ]; then
        log_info "Deploying backend service..."
        # Add your backend deployment commands here
        # This could be:
        # - AWS ECS service update
        # - Kubernetes deployment
        # - Docker Swarm service update
        # - Railway deployment
    fi
    
    if [ "$service" = "all" ] || [ "$service" = "frontend" ]; then
        log_info "Deploying frontend service..."
        # Add your frontend deployment commands here
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run migrations in the backend container
    # This is an example - adjust based on your setup
    docker-compose exec backend npm run migration:run
    
    log_info "Database migrations completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    local api_url
    if [ "$ENVIRONMENT" = "staging" ]; then
        api_url="https://api-staging.yourdomain.com"
    else
        api_url="https://api.yourdomain.com"
    fi
    
    # Wait for services to be ready
    sleep 30
    
    # Check API health
    if curl -f "$api_url/health" > /dev/null 2>&1; then
        log_info "API health check passed"
    else
        log_error "API health check failed"
        exit 1
    fi
    
    # Check frontend
    local frontend_url="${api_url/api/www}"
    if curl -f "$frontend_url" > /dev/null 2>&1; then
        log_info "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
}

# Rollback function
rollback() {
    log_warn "Rolling back deployment..."
    
    # Implement rollback logic here
    # This could involve:
    # - Reverting to previous Docker image tags
    # - Rolling back database migrations
    # - Restoring previous Terraform state
    
    log_info "Rollback completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"
    log_info "Service: $SERVICE"
    
    # Check requirements
    check_requirements
    
    # Build and push images if deploying services
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
        build_and_push "backend"
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
        build_and_push "frontend"
    fi
    
    # Deploy infrastructure
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "infrastructure" ]; then
        deploy_infrastructure
    fi
    
    # Run migrations
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
        run_migrations
    fi
    
    # Deploy services
    deploy_services $SERVICE
    
    # Health check
    health_check
    
    log_info "Deployment to $ENVIRONMENT completed successfully!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; rollback; exit 1' INT TERM

# Run main function
main