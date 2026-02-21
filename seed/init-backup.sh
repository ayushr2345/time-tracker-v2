#!/bin/bash
echo "🟢 Starting auto-restore from test-db.gz..."

# Restore the gzipped archive into the database
mongorestore --archive=/seed-data/test-db.gz --gzip

echo "✅ Dev database successfully populated from backup!"