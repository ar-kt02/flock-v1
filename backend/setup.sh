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

# Prompt user for environment variables
read -p "Enter Database URL: " DATABASE_URL
read -p "Enter JWT Secret: " JWT_SECRET
read -p "Enter Port Number (press enter to default 3001): " PORT
PORT=${PORT:-3001}
read -p "Enter CORS Origin (press enter to default * any): " CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-*}

echo "${GREEN}Creating .env.development file...${NC}"
cat <<EOF > .env.development
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$JWT_SECRET"
PORT="$PORT"
CORS_ORIGIN="$CORS_ORIGIN"
EOF
if [ $? -ne 0 ]; then
  echo "${RED}Failed to create .env.development!${NC}"
  exit 1
fi
echo "${GREEN}Created .env.development file.${NC}"

# Run database migrations
echo "${GREEN}Running database migrations...${NC}"
npm run prisma:migrate:dev
if [ $? -ne 0 ]; then
  echo "${RED}Database migrations failed. Make sure to enter valid database.${NC}"
  rm .env.development
  echo "${RED}Removed .env.development file.${NC}"
  exit 1
fi
echo "${GREEN}Database migrations complete.${NC}"

# Seed the database (optional)
read -r -p "Seed the database? (y/n) " response
case "$response" in
    [yY][eE][sS]|[yY])
        npm run seed:dev
        if [ $? -ne 0 ]; then
          echo "${RED}Database seeding failed!${NC}"
          exit 1
        fi
        ;;
    *)
        echo "${RED}Skipping database seeding.${NC}"
        ;;
esac

# Start development server
npm run dev
if [ $? -ne 0 ]; then
  echo "${RED}Failed to start the development server.${NC}"
  exit 1
fi
