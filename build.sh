#!/bin/bash
# Build script for Render Deployment
set -e

# Build the React frontend
cd app
npm install
npm run build
cd ..

# Install Python backend dependencies
python3 -m pip install -r requirements.txt
