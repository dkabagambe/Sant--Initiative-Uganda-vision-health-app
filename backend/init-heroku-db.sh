#!/bin/bash

echo "🔧 Initializing PostgreSQL database on Heroku..."

# Run the SQL initialization script
heroku pg:psql -a sante-production-app < init-postgres.sql

echo "✅ Database initialized successfully!"
echo ""
echo "📊 Checking tables..."
heroku pg:psql -a sante-production-app -c "\dt"
