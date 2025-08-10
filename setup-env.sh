#!/bin/bash

# Gym Tracker Environment Setup Script

echo "🏋️  Gym Tracker - Environment Setup"
echo "=================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    echo "Please edit it manually or remove it first."
    exit 1
fi

# Create .env.local file
echo "Creating .env.local file..."
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ .env.local file created!"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Get your Project URL and anon key from Settings → API"
echo "3. Replace the placeholder values in .env.local with your actual credentials"
echo "4. Run the database schema from supabase/schema.sql in your Supabase SQL Editor"
echo ""
echo "📖 See SUPABASE_SETUP.md for detailed instructions" 