#!/bin/bash

# Define colour codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Colour

# Install dependencies
npm install
if [ $? -ne 0 ]; then
  echo "${RED}Failed to install packages.${NC}"
  exit 1
fi

# Prompt user for public backend URL
read -p "Enter .env public API URL (press enter to default localhost): " BACKEND_URL

if [ -n "$BACKEND_URL" ]; then
  echo "${GREEN}Creating .env file...${NC}"
  cat <<EOF > .env
NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL"
EOF
  if [ $? -ne 0 ]; then
    echo "${RED}Failed to create .env file!${NC}"
    exit 1
  fi
  echo "${GREEN}Created .env file created with public backend API.${NC}"
else
  echo "${GREEN}.env file creation skipped.${NC}"
fi


# Start development server
npm run dev
if [ $? -ne 0 ]; then
  echo "${RED}Failed to start the development server.${NC}"
  exit 1
fi
