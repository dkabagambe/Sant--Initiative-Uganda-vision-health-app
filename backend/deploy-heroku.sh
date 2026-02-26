#!/bin/bash

echo "🚀 Deploying Santé Backend to Heroku..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from backend directory"
  exit 1
fi

# Check if heroku CLI is installed
if ! command -v heroku &> /dev/null; then
  echo "❌ Heroku CLI not installed. Install from: https://devcenter.heroku.com/articles/heroku-cli"
  exit 1
fi

# Set app name
APP_NAME="${HEROKU_APP_NAME:-sante-production-app-42dca70009b0}"

echo "📦 Setting environment variables..."

# Set required environment variables
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set PORT=5000 -a $APP_NAME

# Generate JWT secret if not exists
JWT_SECRET=$(heroku config:get JWT_SECRET -a $APP_NAME)
if [ -z "$JWT_SECRET" ]; then
  echo "🔑 Generating new JWT secret..."
  heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a $APP_NAME
fi

# Check if DATABASE_URL exists (PostgreSQL addon)
DATABASE_URL=$(heroku config:get DATABASE_URL -a $APP_NAME)
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  No PostgreSQL database found. Adding Heroku Postgres..."
  heroku addons:create heroku-postgresql:essential-0 -a $APP_NAME
  echo "✅ PostgreSQL addon added"
else
  echo "✅ PostgreSQL database already configured"
fi

echo ""
echo "📋 Current configuration:"
heroku config -a $APP_NAME

echo ""
echo "🔨 Deploying to Heroku..."

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit for Heroku deployment"
fi

# Add heroku remote if not exists
if ! git remote | grep -q heroku; then
  echo "🔗 Adding Heroku remote..."
  heroku git:remote -a $APP_NAME
fi

# Deploy
git push heroku main || git push heroku master:main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Checking deployment status..."
heroku ps -a $APP_NAME

echo ""
echo "📊 Testing API health..."
sleep 5
curl https://$APP_NAME.herokuapp.com/api/health

echo ""
echo ""
echo "🎉 Deployment finished!"
echo "📱 App URL: https://$APP_NAME.herokuapp.com"
echo "🔍 View logs: heroku logs --tail -a $APP_NAME"
echo "📊 Dashboard: https://dashboard.heroku.com/apps/$APP_NAME"
