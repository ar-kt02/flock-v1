#!/bin/bash

# Define colour codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Colour

# Error handling function
handle_error() {
    echo "${RED}Error: $1${NC}"
    exit 1
}

green_text() {
    echo "${GREEN}$1${NC}"
}

# Install backend & frontend dependencies
install_dependencies() {
    for dir in backend frontend; do
        green_text "Installing $dir dependencies..."
        cd "$dir" || handle_error "Cannot navigate to $dir directory"
        npm install || handle_error "Failed to install $dir packages"
        cd ..
    done
}

# Configure environment variables
configure_env() {
    green_text "Setting up environment variables..."
    read -p "Enter Database URL (required):" DATABASE_URL
    read -p "Enter JWT Secret (required):" JWT_SECRET
    read -p "Enter Port Number (press enter to default 3001): " PORT
    PORT=${PORT:-3001}
    read -p "Enter CORS Origin (press enter to default * any): " CORS_ORIGIN
    CORS_ORIGIN=${CORS_ORIGIN:-*}

    # Backend .env.development
    green_text "Creating backend .env.development file with environment variables..."
    cat > backend/.env.development << EOF || handle_error "Failed to create backend .env.development file"
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$JWT_SECRET"
PORT="$PORT"
CORS_ORIGIN="$CORS_ORIGIN"
EOF

    # Frontend .env.local
    green_text "Creating frontend .env.local file with environment variables..."
    cat > frontend/.env.local << EOF || handle_error "Failed to create frontend .env.local file"
NEXT_PUBLIC_BACKEND_URL="http://localhost:$PORT"
EOF
}

# Run migrations, and seed (optional)
setup_database() {
    green_text "Running database prisma migrations..."
    cd backend
    npm run migrate:dev || handle_error "Database migrations failed. Make sure to enter valid database."
    green_text "Database prisma migrations complete..."
    
    read -n 1 -p "Seed database? (y/n): " seed_choice
    echo
    
    if [[ "$seed_choice" =~ ^[Yy]$ ]]; then
        green_text "Seeding database..."
        npm run seed:dev || handle_error "Database seeding failed"
    else
        green_text "Skipped database seeding."
    fi
    cd ..
}

# Start development servers
start_servers() {
    green_text "Starting development servers"
    
    green_text "Starting backend development server"
    cd backend
    npm run dev & 
    
    green_text "Starting frontend development server"
    cd ../frontend
    npm run dev 
}

# Main execution
main() {
    install_dependencies
    configure_env
    setup_database
    start_servers
}

main