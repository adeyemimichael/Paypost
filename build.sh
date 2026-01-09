#!/bin/bash

echo "🔨 Building ContentPlatform smart contract..."

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Please install it first:"
    echo "💡 curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
    exit 1
fi

# Clean previous build
rm -rf build/

# Build the Move package
echo "📦 Compiling Move modules..."
aptos move compile --named-addresses ContentPlatform=0xa74c3b75410a0681f854cfe2b869a3cd6b959d7dbe551aef4781c6a3ff3aa8dd

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Bytecode generated in build/ directory"
    echo ""
    echo "🚀 Ready to deploy! Run:"
    echo "DEPLOYER_PRIVATE_KEY=your_private_key node deploy.js"
else
    echo "❌ Build failed!"
    exit 1
fi