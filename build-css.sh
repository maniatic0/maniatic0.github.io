#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")"

# 1. Create directories if they don't exist
mkdir -p _build-assets
mkdir -p assets/css

echo "🚀 Starting Tailwind CSS build process..."

# 2. Run the Tailwind build command
# -i: input file (now in _build-assets)
# -o: output file (in assets/css)
# --minify: optimize for production
echo "🔨 Building CSS..."
./node_modules/.bin/tailwindcss -i ./_build-assets/input.css -o ./assets/css/output.css --minify

# 3. Check if the output file was created
if [ -f "./assets/css/output.css" ]; then
    echo "✅ Build successful! Output located at assets/css/output.css"
else
    echo "❌ Build failed! Output file not found."
    exit 1
fi

echo "✨ Done."
