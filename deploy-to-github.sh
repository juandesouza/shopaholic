#!/bin/bash

# Quick script to deploy to GitHub
# Run: ./deploy-to-github.sh

set -e

echo "🚀 Deploying shopaholic to GitHub..."

# Check if authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "📝 Please run: gh auth login"
    echo "   Then run this script again."
    exit 1
fi

# Create repo and push
echo "📦 Creating GitHub repository..."
gh repo create shopaholic --public --source=. --remote=origin --push

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🌐 Repository: https://github.com/$(gh api user --jq .login)/shopaholic"
echo ""
echo "Next step: Deploy to Vercel"
echo "Run: vercel (or use Vercel dashboard)"

