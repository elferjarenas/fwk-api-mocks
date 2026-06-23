#!/bin/bash

# Generic test runner that starts server first
# Usage: ./test/run-tests.sh jest-config.json [jest-args...]

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: $0 <jest-config.json> [jest-args...]"
  exit 1
fi

JEST_CONFIG="$1"
shift  # Remove first arg, rest are jest args

# Configuration
API_URL=${API_URL:-"http://localhost:5050"}
PORT=$(echo "$API_URL" | sed -E 's|.*:([0-9]+).*|\1|')

echo "🔨 Compiling TypeScript..."
npm run build || {
  echo "❌ Build failed"
  exit 1
}

echo "🧹 Cleaning up previous processes..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
pkill -9 -f "node.*dist/src/app.js" 2>/dev/null || true
sleep 1

echo "🚀 Starting server..."
AUTO_SEED=true SEED_TYPE=test node dist/src/app.js > server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to be ready..."
MAX_ATTEMPTS=30
for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ Server is ready!"
    break
  fi
  if [ $i -eq $MAX_ATTEMPTS ]; then
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Wait for data to load
sleep 2

echo "🧪 Running tests..."
jest --config "./test/$JEST_CONFIG" "$@"
TEST_EXIT_CODE=$?

echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

echo "✅ Server stopped"
exit $TEST_EXIT_CODE
