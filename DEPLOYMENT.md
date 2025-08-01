# Deployment Guide for Freelance Invoice SaaS

This guide provides comprehensive instructions for deploying the Freelance Invoice SaaS application across different environments.

## 🏗️ Architecture Overview

The application consists of:
- **Frontend**: Next.js application
- **Backend**: NestJS API server
- **Database**: PostgreSQL
- **Cache**: Redis
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Infrastructure**: Terraform (AWS)

## 🚀 Quick Start

### Development Environment

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd freelance-invoice-saas
   cp .env.example .env
   ```

2. **Start with Docker Compose**:
   ```bash
   make dev
   # or
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3002
   - Grafana: http://localhost:3000
   - Prometheus: http://localhost:9090

### Production Deployment

1. **Using the deployment script**:
   ```bash
   ./scripts/deploy.sh production all
   ```

2. **Manual deployment**:
   ```bash
   make deploy
   ```

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🐳 Docker Deployment

### Build Images
```bash
# Backend
docker build -t invoice-saas-backend:latest ./backend

# Frontend
docker build -t invoice-saas-frontend:latest ./frontend
```

### Run with Docker Compose
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

## ☁️ Cloud Deployment Options

### 1. AWS (Recommended)

#### Prerequisites
- AWS CLI configured
- Terraform installed
- Domain name configured

#### Deploy Infrastructure
```bash
cd infrastructure
terraform init
terraform workspace new production
terraform plan -var="environment=production" -var="domain_name=yourdomain.com"
terraform apply
```

#### Deploy Application
```bash
./scripts/deploy.sh production all
```

### 2. Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**:
   ```bash
   railway link <project-id>
   railway up
   ```

### 3. Vercel (Frontend Only)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel --prod
   ```

### 4. Heroku

#### Backend
```bash
# Create app
heroku create invoice-saas-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Deploy
git subtree push --prefix backend heroku main
```

#### Frontend
```bash
# Create app
heroku create invoice-saas-frontend

# Deploy
git subtree push --prefix frontend heroku main
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:

1. **Runs tests** on every PR
2. **Security scans** with Trivy and Snyk
3. **Builds and pushes** Docker images
4. **Deploys to staging** on develop branch
5. **Deploys to production** on main branch
6. **Runs performance tests** after staging deployment

### Setting up CI/CD

1. **Add secrets to GitHub**:
   - `SNYK_TOKEN`
   - `SLACK_WEBHOOK`
   - `K6_CLOUD_TOKEN`
   - Cloud provider credentials

2. **Configure environments**:
   - Create `staging` and `production` environments in GitHub
   - Add environment-specific secrets

## 📊 Monitoring Setup

### Prometheus Metrics
- Application metrics: `/metrics`
- Health checks: `/health`
- Custom business metrics

### Grafana Dashboards
- Application performance
- Infrastructure metrics
- Business KPIs
- Error tracking

### Alerts
Configured alerts for:
- High error rates
- Slow response times
- Database/Redis issues
- High resource usage
- SSL certificate expiration

## 🔒 Security Considerations

### SSL/TLS
- Use Let's Encrypt for free SSL certificates
- Implement HSTS headers
- Enable HTTP/2

### Security Headers
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Rate Limiting
- API rate limiting with Redis
- DDoS protection via Cloudflare/AWS Shield

### Secrets Management
- Use AWS Parameter Store/Secrets Manager
- Never commit secrets to git
- Rotate secrets regularly

## 🧪 Testing

### Unit Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Integration Tests
```bash
# Backend E2E tests
cd backend && npm run test:e2e
```

### Performance Tests
```bash
# K6 load testing
k6 run tests/performance/load-test.js
```

### Security Tests
```bash
# Vulnerability scanning
make security-scan
```

## 📈 Scaling

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Increase container resources
- Database instance upgrades
- Redis memory optimization

### Auto-scaling
- AWS ECS with Application Auto Scaling
- Kubernetes HPA (if using K8s)

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
docker-compose exec backend npm run migration:status

# Check logs
docker-compose logs postgres
```

#### 2. Redis Connection Issues
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Check logs
docker-compose logs redis
```

#### 3. Application Not Starting
```bash
# Check application logs
docker-compose logs backend
docker-compose logs frontend

# Check health endpoints
curl http://localhost/health
```

### Health Checks

#### Backend Health Check
```bash
curl http://localhost:3002/health
```

#### Frontend Health Check
```bash
curl http://localhost:3001/api/health
```

### Log Analysis
```bash
# Application logs
make logs

# Specific service logs
make logs-backend
make logs-frontend
make logs-db
```

## 🔄 Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
./scripts/deploy.sh production rollback
```

### Manual Rollback
1. Revert to previous Docker image tags
2. Run database migration rollback if needed
3. Update load balancer to previous version

### Database Rollback
```bash
# Backup current database
make backup

# Restore from backup
make restore backup_file.sql
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Environment variables updated
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] Backup created

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing complete

### Production Deployment
- [ ] Staged rollout plan
- [ ] Rollback plan ready
- [ ] Team notifications sent
- [ ] Documentation updated

## 🆘 Support

For deployment issues:
1. Check this documentation
2. Review application logs
3. Check monitoring dashboards
4. Contact the development team

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform Documentation](https://www.terraform.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)