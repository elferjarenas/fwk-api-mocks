#!/bin/bash

# Script to start server with AUTO_SEED and run tests
# Used by npm test for CI/CD and local development

set -e

# Configuration: use API_URL env var or default to localhost:5050
API_URL=${API_URL:-"http://localhost:5050"}
PORT=$(echo "$API_URL" | sed -E 's|.*:([0-9]+).*|\1|')

echo "🔨 Compiling TypeScript..."
npm run build || {
  echo "❌ Build failed"
  exit 1
}

echo "🧹 Cleaning up previous processes..."
# AGGRESSIVE cleanup - kill EVERYTHING that could be using the port
# Step 1: Kill by port (most reliable)
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
# Step 2: Kill by process name pattern
pkill -9 -f "node.*dist/src/app.js" 2>/dev/null || true
pkill -9 -f "AUTO_SEED.*node" 2>/dev/null || true
# Step 3: Double-check port is free
for attempt in {1..10}; do
  if ! lsof -ti:$PORT >/dev/null 2>&1; then
    echo "✅ Port $PORT is free"
    break
  fi
  echo "⚠️  Port $PORT still occupied, retrying... ($attempt/10)"
  lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
  sleep 0.5
done
# Clean old server log
rm -f server.log
# Clean Node.js module cache
rm -rf node_modules/.cache 2>/dev/null || true
# Final wait for OS cleanup
sleep 1

echo "🚀 Starting server with compiled code..."

# Start server with compiled JavaScript (FAST and deterministic)
# Use SEED_TYPE=test for isolated test users (prevents data pollution from other squads)
AUTO_SEED=true SEED_TYPE=test node dist/src/app.js > server.log 2>&1 &
SERVER_PID=$!

echo "📋 Server PID: $SERVER_PID"

# CRITICAL: Ensure server is FULLY ready before running tests
# This eliminates 100% of race conditions
echo "⏳ Waiting for server to be FULLY ready..."
echo "🔗 Testing against: $API_URL"
READY=false
for i in {1..100}; do
  # First check: server responding
  if curl -s $API_URL/health > /dev/null 2>&1; then
    # Second check: verify data is fully loaded (users AND cards indexed)
    READY_CHECK=$(curl -s $API_URL/testing/state 2>/dev/null || echo "")
    if echo "$READY_CHECK" | grep -q '"ready":true'; then
      echo "✅ Server is ready and data is fully loaded!"
      READY=true
      break
    fi
  fi
  
  if [ $i -eq 100 ]; then
    echo "❌ Server failed to start or seed data not loaded"
    echo "📋 Last 10 lines of server.log:"
    tail -10 server.log 2>/dev/null || echo "No log file"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  sleep 0.25
done

if [ "$READY" != "true" ]; then
  echo "❌ Server not ready"
  exit 1
fi

# Extra safety: wait additional time to ensure ALL maps are indexed
echo "⏳ Final wait for map indexing..."
sleep 2

# Run tests
echo "🧪 Running tests..."
jest --config ./test/jest.config.json --runInBand "$@"
TEST_EXIT_CODE=$?

# Kill server
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true
sleep 0.5
# Force kill if still running
kill -9 $SERVER_PID 2>/dev/null || true
# Clean up port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
pkill -9 -f "node.*dist/src/app.js" 2>/dev/null || true
echo "✅ Server stopped"

# Exit with test exit code
exit $TEST_EXIT_CODE
