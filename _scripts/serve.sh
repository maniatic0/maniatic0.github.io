#!/bin/bash

# Jekyll server launcher for the portfolio website
# Kills any existing Jekyll instance, clears the build cache, and starts fresh.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Checking for existing Jekyll processes..."
if pgrep -f "jekyll" > /dev/null 2>&1; then
    echo "  Found existing process(es). Killing..."
    pkill -f "jekyll"
    sleep 1
    echo "  Done."
else
    echo "  No existing processes found."
fi

echo "🧹 Clearing build cache..."
rm -rf "$PROJECT_DIR/_site"
echo "  Done."

echo "🚀 Starting Jekyll server on http://localhost:4000..."
cd "$PROJECT_DIR"
nohup jekyll serve --host 0.0.0.0 --port 4000 --force_polling > /tmp/jekyll.log 2>&1 &
echo "Server PID: $!"
echo "  Waiting for server to start..."

for i in $(seq 1 10); do
    if curl -s --max-time 2 http://localhost:4000/ > /dev/null 2>&1; then
        echo "✅ Jekyll server is up and running!"
        exit 0
    fi
    sleep 1
done

echo "⚠️  Server may still be starting. Check /tmp/jekyll.log for details."
