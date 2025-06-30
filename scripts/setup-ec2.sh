#!/bin/bash

# EC2 Setup Script for Expense Management App
# Run this script on your EC2 instance to set up the environment

set -e

echo "🚀 Setting up EC2 instance for Expense Management App..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/expense-management
sudo chown $USER:$USER /var/www/expense-management

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/expense-management > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/expense-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start and enable services
echo "🔧 Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl reload nginx

# Setup PM2 to start on boot
echo "🔧 Setting up PM2 startup..."
pm2 startup | grep -E '^sudo' | bash || true

# Configure firewall (if UFW is available)
if command -v ufw &> /dev/null; then
    echo "🔒 Configuring firewall..."
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
fi

echo "✅ EC2 setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add your GitHub repository as a deploy key or configure SSH access"
echo "2. Set up GitHub secrets for EC2 deployment:"
echo "   - EC2_HOST: Your EC2 instance public IP"
echo "   - EC2_USER: ubuntu (or ec2-user for Amazon Linux)"
echo "   - EC2_SSH_KEY: Your private SSH key content"
echo "3. Push your code to trigger the deployment workflow"
echo ""
echo "🌐 Your app will be available at: http://$(curl -s ifconfig.me)"
echo ""
echo "📊 Useful commands:"
echo "  - Check PM2 status: pm2 status"
echo "  - View logs: pm2 logs expense-management"
echo "  - Restart app: pm2 restart expense-management"
echo "  - Check Nginx: sudo systemctl status nginx"
