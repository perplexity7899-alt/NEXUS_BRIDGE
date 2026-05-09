#!/bin/bash
# Vercel build script for NEXUS_BRIDGE
set -e

echo "🔨 Building NEXUS_BRIDGE..."
npm install
npm run build

echo "✅ Build complete"
