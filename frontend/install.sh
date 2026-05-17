#!/bin/bash

echo "Installing Cafe Management Frontend Dependencies..."

# Install npm dependencies
npm install

# Create environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from template"
fi

echo "Installation complete!"
echo "Run 'npm start' to start the development server"
