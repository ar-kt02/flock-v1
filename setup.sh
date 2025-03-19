#!/bin/bash

# Define colour codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Colour

# Install backend dependencies
echo "${GREEN}Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
  echo "${RED}Failed to install backend packages.${NC}"
  exit 1
fi
cd ..

# Install frontend dependencies
echo "${GREEN}Installing frontend dependencies...${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
  echo "${RED}Failed to install frontend packages.${NC}"
  exit 1
fi
cd ..

# Prompt user for backend environment variables
echo "${GREEN}Setting up backend environment variables...${NC}"
read -p "Enter Database URL: " DATABASE_URL
read -p "Enter JWT Secret: " JWT_SECRET
read -p "Enter Port Number (press enter to default 3001): " PORT
PORT=${PORT:-3001}
read -p "Enter CORS Origin (press enter to default * any): " CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-*}

echo "${GREEN}Creating backend .env.development file...${NC}"
cat <<EOF > backend/.env.development
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$JWT_SECRET"
PORT="$PORT"
CORS_ORIGIN="$CORS_ORIGIN"
EOF
if [ $? -ne 0 ]; then
  echo "${RED}Failed to create backend .env.development!${NC}"
  exit 1
fi
echo "${GREEN}Created backend .env.development file.${NC}"

# Run backend database migrations
echo "${GREEN}Running backend database migrations...${NC}"
cd backend
npm run prisma:migrate:dev
if [ $? -ne 0 ]; then
  echo "${RED}Database migrations failed. Make sure to enter valid database.${NC}"
  rm .env.development
  echo "${RED}Removed backend .env.development file.${NC}"
  exit 1
fi
cd ..
echo "${GREEN}Backend database migrations complete.${NC}"

# Seed the backend database (optional)
read -r -p "Seed the backend database? (y/n) " response
case "$response" in
    [yY][eE][sS]|[yY])
        cd backend
        npm run seed:dev
        if [ $? -ne 0 ]; then
          echo "${RED}Database seeding failed!${NC}"
          exit 1
        fi
        cd ..
        ;;
    *)
        echo "${GREEN}Skipping backend database seeding.${NC}"
        ;;
esac

# Prompt user for frontend public backend URL
echo "${GREEN}Setting up frontend environment variables...${NC}"
read -p "Enter .env public API URL (press enter to default localhost): " BACKEND_URL

if [ -n "$BACKEND_URL" ]; then
  echo "${GREEN}Creating frontend .env file...${NC}"
  cd frontend
  cat <<EOF > .env
NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL"
EOF
  if [ $? -ne 0 ]; then
    echo "${RED}Failed to create frontend .env file!${NC}"
    exit 1
  fi
  cd ..
  echo "${GREEN}Created frontend .env file created with public backend API.${NC}"
else
  echo "${GREEN}Frontend .env file creation skipped.${NC}"
fi

# Start development servers
echo "${GREEN}Starting development servers...${NC}"
echo "${GREEN}Starting backend development server...${NC}"
cd backend
npm run dev &

echo "${GREEN}Starting frontend development server...${NC}"
cd ../frontend
npm run dev
