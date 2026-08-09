#!/bin/bash
# Build script for Render Deployment
set -e

# Build the React frontend
cd app
npm install
npm run build
cd ..

# Install Python backend dependencies in a virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
