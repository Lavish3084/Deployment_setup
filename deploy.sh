#!/bin/bash

# Configuration
WORKSPACE_PATH="/workspace/panel"
BACKEND_NAME="panel-backend"
FRONTEND_NAME="panel-frontend"
FRONTEND_PORT="3005"

echo "🚀 Starting self-deployment for Mini PaaS..."

# Go to workspace
cd $WORKSPACE_PATH || exit

echo "🚀 Pulling latest code from GitHub..."
git pull origin main

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Building frontend..."
cd ../frontend
npm install
npm run build

echo "🧹 Cleaning old build files..."
# Vite builds to 'dist', but user template uses 'build'. 
# We'll support both or prioritize 'dist' for Vite.
rm -rf dist

echo "🔁 Restarting services with PM2..."

# Restart backend
cd ../backend
pm2 restart $BACKEND_NAME || pm2 start index.js --name $BACKEND_NAME

# Restart/Start frontend using serve
cd ../frontend
pm2 restart $FRONTEND_NAME || pm2 start "npx serve -s dist -l $FRONTEND_PORT" --name $FRONTEND_NAME

pm2 save

echo "✅ Self-deployment complete!"
