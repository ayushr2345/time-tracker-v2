#!/bin/bash

# ==========================================
# 1. CONFIGURATION
# ==========================================
# Change this to the exact path where your repository lives on the server
PROJECT_DIR="/home/ayushr2345/apps/time-tracker-v2"
BRANCH="master"

# Fix for Cron: Cron runs with a very limited environment. 
# This ensures it can find 'npm', 'node', and 'docker'.
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/snap/bin
# If you use NVM for node, uncomment the next two lines:
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd $PROJECT_DIR || { echo "Directory not found! Exiting."; exit 1; }

# ==========================================
# 2. CHECK FOR UPDATES
# ==========================================
# Fetch the latest metadata from GitHub silently
git fetch origin $BRANCH

# Compare local and remote commits
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    # No changes. Exit silently to keep logs clean.
    exit 0
fi

echo "========================================"
echo "$(date): New update detected! Pulling commit $REMOTE_COMMIT..."

# Pull the new code
git pull origin $BRANCH

# ==========================================
# 3. PRE-DEPLOYMENT SAFETY TESTS
# ==========================================
echo "$(date): Running safety tests..."

# Install dependencies strictly following package-lock.json
npm ci

# Build the shared workspace (Vitest needs this to resolve imports)
npm run build --workspace=@time-tracker/shared

# Run the frontend unit tests
npm run test --workspace=frontend

# Capture the exact exit code of the test command (0 = Pass, 1 = Fail)
TEST_STATUS=$?

# ==========================================
# 4. THE GATEKEEPER LOGIC
# ==========================================
if [ $TEST_STATUS -eq 0 ]; then
    echo "$(date): ✅ Tests PASSED! Proceeding with deployment..."
    
    # Rebuild the prod containers. Docker cache makes this incredibly fast.
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Clean up old dangling images to save disk space
    docker image prune -f
    
    echo "$(date): 🚀 Deployment successful."
else
    echo "$(date): ❌ Tests FAILED! Deployment aborted."
    echo "The running Docker containers were NOT updated. Your app is still live on the previous stable version."
fi

# ==========================================
# 5. AUTO-UPDATE THE RUNNER
# ==========================================
# Copy the latest deployment script from the repo to the home directory
# so it is ready for the next minute's cron job.
cp $PROJECT_DIR/scripts/deploy.sh /home/ayushr2345/apps/deploy.sh
chmod +x /home/ayushr2345/apps/deploy.sh

echo "========================================"
