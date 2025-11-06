#!/bin/bash

# Script to set up GitHub repository for shopaholic

echo "🚀 Setting up GitHub repository..."

# Check if already authenticated
if gh auth status &>/dev/null; then
    echo "✅ Already authenticated with GitHub"
else
    echo "📝 Please authenticate with GitHub..."
    echo "Run: gh auth login"
    echo "Then run this script again, or continue with:"
    echo "  gh repo create shopaholic --public --source=. --remote=origin --push"
    exit 1
fi

# Create repository and push
echo "📦 Creating GitHub repository..."
gh repo create shopaholic --public --source=. --remote=origin --push

echo "✅ Repository created and code pushed to GitHub!"
echo "🌐 Your repository: https://github.com/$(gh api user --jq .login)/shopaholic"

