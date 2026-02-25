#!/bin/bash

echo "🔄 Running database migration for screenings table..."

# Path to the SQLite database
DB_PATH="./sante.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at $DB_PATH"
    exit 1
fi

echo "📊 Applying migrations to screenings table..."

# Run the migration SQL
sqlite3 "$DB_PATH" < migrate-screenings.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
    
    # Verify the columns exist
    echo "🔍 Verifying table schema..."
    sqlite3 "$DB_PATH" ".schema screenings" | head -20
    
else
    echo "❌ Migration failed"
    exit 1
fi
