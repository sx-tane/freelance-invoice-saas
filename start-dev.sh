#!/bin/bash

echo "🚀 Starting Freelance Invoice SaaS Development Environment"
echo "========================================================="

# Clean up any stuck containers
echo "Cleaning up existing containers..."
docker rm -f freelance-postgres 2>/dev/null || true
docker rm -f freelance-postgres-new 2>/dev/null || true

# Start fresh PostgreSQL
echo "Starting fresh PostgreSQL database..."
docker run -d --name freelance-postgres-clean \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_DB=freelance_invoice \
    -p 5435:5432 \
    postgres:13

echo "Waiting for database to be ready..."
sleep 8

# Start backend
echo ""
echo "🔧 Starting Backend (NestJS) on http://localhost:3002"
echo "-----------------------------------------------------"
cd backend
npm run start:dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 10

# Start frontend
echo ""
echo "🎨 Starting Frontend (Next.js) on http://localhost:3001"
echo "-------------------------------------------------------"
cd ../frontend
PORT=3001 npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Development environment is starting up!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:3001"
echo "   - Backend API: http://localhost:3002"
echo "   - API Documentation: http://localhost:3002/api"
echo ""
echo "📝 Default credentials:"
echo "   - Email: admin@example.com"
echo "   - Password: password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID