#!/bin/bash

###############################################################################
# Admin User Seed Script
# 
# This script creates an admin user for the CS Department Portal.
# It wraps the Node.js create-admin.js script for easier usage.
#
# Usage:
#   ./scripts/seed-admin.sh
#   
# Or with arguments:
#   ./scripts/seed-admin.sh admin@example.com SecurePassword123
#
# Environment Variables:
#   ADMIN_EMAIL       - Email for the admin user
#   ADMIN_PASSWORD    - Password for the admin user
#   SUPABASE_SERVICE_ROLE_KEY - Required for creating admin users
#
# SECURITY WARNING:
#   Only run this script in development/staging environments!
#   Never use default credentials in production!
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}CS Department Portal - Admin Seeder${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if we're in development
if [ "${NODE_ENV}" = "production" ]; then
    echo -e "${RED}ERROR: This script should not be run in production!${NC}"
    echo "Please create admin users manually via secure methods in production."
    exit 1
fi

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}WARNING: .env file not found!${NC}"
    echo "Please create a .env file with SUPABASE_SERVICE_ROLE_KEY"
    echo "See .env.example for reference"
    exit 1
fi

# Load environment variables from .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Check for service role key
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}ERROR: SUPABASE_SERVICE_ROLE_KEY not found!${NC}"
    echo "Please set this in your .env file"
    exit 1
fi

# Change to scripts directory
cd "$SCRIPT_DIR"

# Check if node_modules exists in scripts directory
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Parse arguments
EMAIL="${1:-$ADMIN_EMAIL}"
PASSWORD="${2:-$ADMIN_PASSWORD}"

# If arguments provided, use them
if [ -n "$EMAIL" ] && [ -n "$PASSWORD" ]; then
    echo -e "${GREEN}Creating admin user with provided credentials...${NC}"
    node create-admin.js --email "$EMAIL" --password "$PASSWORD"
else
    echo -e "${GREEN}Creating admin user (interactive mode)...${NC}"
    echo "You will be prompted for email and password"
    echo ""
    node create-admin.js
fi

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}Admin user created successfully!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo "You can now log in with the admin credentials at:"
    echo "http://localhost:8080/auth"
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}Failed to create admin user${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    echo "Please check the error messages above and try again"
fi

exit $EXIT_CODE
