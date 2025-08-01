# Makefile for Invoice SaaS

.PHONY: help install build test clean dev prod deploy logs backup

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install all dependencies"
	@echo "  build       - Build all services"
	@echo "  test        - Run all tests"
	@echo "  dev         - Start development environment"
	@echo "  prod        - Start production environment"
	@echo "  deploy      - Deploy to specified environment"
	@echo "  logs        - Show logs for all services"
	@echo "  clean       - Clean up containers and volumes"
	@echo "  backup      - Backup database"
	@echo "  restore     - Restore database from backup"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Build services
build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose up --build -d

# Deploy to environment
deploy:
	@read -p "Enter environment (staging/production): " env; \
	./scripts/deploy.sh $$env all

# Deploy specific service
deploy-backend:
	@read -p "Enter environment (staging/production): " env; \
	./scripts/deploy.sh $$env backend

deploy-frontend:
	@read -p "Enter environment (staging/production): " env; \
	./scripts/deploy.sh $$env frontend

# Show logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Clean up
clean:
	@echo "Stopping all containers..."
	docker-compose down
	@echo "Removing unused containers, networks, and images..."
	docker system prune -f
	@echo "Removing volumes..."
	docker-compose down -v

# Database operations
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres invoice_saas > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore:
	@read -p "Enter backup file path: " backup; \
	docker-compose exec -T postgres psql -U postgres invoice_saas < $$backup

# Monitoring
monitor:
	@echo "Opening monitoring dashboard..."
	open http://localhost:3000  # Grafana

metrics:
	@echo "Opening metrics dashboard..."
	open http://localhost:9090  # Prometheus

# Security scan
security-scan:
	@echo "Running security scan..."
	docker run --rm -v $(PWD):/app aquasec/trivy fs /app

# Performance test
performance-test:
	@echo "Running performance tests..."
	k6 run tests/performance/load-test.js

# Health check
health:
	@echo "Checking service health..."
	curl -f http://localhost/health || echo "Health check failed"
	curl -f http://localhost/api/health || echo "API health check failed"

# Linting
lint:
	@echo "Running backend linting..."
	cd backend && npm run lint
	@echo "Running frontend linting..."
	cd frontend && npm run lint

# Format code
format:
	@echo "Formatting backend code..."
	cd backend && npm run format
	@echo "Formatting frontend code..."
	cd frontend && npm run format

# Setup development environment
setup-dev:
	@echo "Setting up development environment..."
	cp .env.example .env
	make install
	make dev