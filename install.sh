#!/bin/bash

echo "================================================================================"
echo "                    NSS PORTAL - INSTALLATION SCRIPT"
echo "================================================================================"
echo

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    echo "Choose LTS version (recommended)"
    exit 1
fi
echo "Node.js is installed ✓"

# Check npm installation
echo
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please install Node.js which includes npm"
    exit 1
fi
echo "npm is installed ✓"

# Install backend dependencies
echo
echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies!"
    exit 1
fi
echo "Backend dependencies installed ✓"

# Install frontend dependencies
echo
echo "Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies!"
    exit 1
fi
cd ..
echo "Frontend dependencies installed ✓"

# Create environment file
echo
echo "Creating environment file..."
if [ ! -f .env ]; then
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/nss-portal
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PORT=5002
EOF
    echo "Environment file created ✓"
else
    echo "Environment file already exists ✓"
fi

echo
echo "================================================================================"
echo "                    INSTALLATION COMPLETED SUCCESSFULLY!"
echo "================================================================================"
echo
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Update .env file with your settings"
echo "3. Run: npm run start:all"
echo
echo "Access points:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5002/api"
echo
