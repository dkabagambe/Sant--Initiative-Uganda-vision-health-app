#!/bin/bash

echo "🚀 Quick Heroku Deployment & OTP Fix"
echo "====================================="
echo ""

# Check if in backend directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run from backend directory"
  exit 1
fi

APP_NAME="sante-production-app"

echo "Step 1: Committing changes..."
git add .
git commit -m "Fix OTP verification for PostgreSQL on Heroku" || echo "No changes to commit"

echo ""
echo "Step 2: Checking Heroku remote..."
if ! git remote | grep -q heroku; then
  echo "Adding Heroku remote..."
  heroku git:remote -a $APP_NAME
fi

echo ""
echo "Step 3: Setting environment variables..."
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set PORT=5000 -a $APP_NAME

# Check if JWT_SECRET exists
JWT_SECRET=$(heroku config:get JWT_SECRET -a $APP_NAME 2>/dev/null)
if [ -z "$JWT_SECRET" ]; then
  echo "Generating JWT secret..."
  heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a $APP_NAME
fi

echo ""
echo "Step 4: Checking PostgreSQL..."
DATABASE_URL=$(heroku config:get DATABASE_URL -a $APP_NAME 2>/dev/null)
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  No PostgreSQL found. Adding..."
  heroku addons:create heroku-postgresql:essential-0 -a $APP_NAME
  echo "✅ PostgreSQL added. Waiting 10 seconds for provisioning..."
  sleep 10
else
  echo "✅ PostgreSQL already configured"
fi

echo ""
echo "Step 5: Deploying to Heroku..."
git push heroku main 2>/dev/null || git push heroku master:main

echo ""
echo "Step 6: Initializing database..."
heroku run node scripts/init-db.js -a $APP_NAME

echo ""
echo "Step 7: Restarting app..."
heroku restart -a $APP_NAME

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Testing OTP system..."
sleep 5

# Run test
./test-otp-heroku.sh

echo ""
echo "🎉 Done! Your app is ready at:"
echo "   https://$APP_NAME.herokuapp.com"
echo ""
echo "📝 View logs: heroku logs --tail -a $APP_NAME"
