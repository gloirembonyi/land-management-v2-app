# Database Setup Instructions

## Required Steps to Fix Authentication Error

The error "relation 'users' does not exist" occurs because the database tables haven't been created yet.

### Step 1: Initialize Database Schema
Run the database initialization script to create all required tables:
- Click "Run Script" for `scripts/init-database.sql`

### Step 2: Add Test Data
Run the test data script to create the test users:
- Click "Run Script" for `scripts/seed-test-data.sql`

### Test Credentials
After running the scripts, you can login with these credentials:

**Admin User:**
- NIDA: `1195432109876543`
- Password: `admin123`

**Seller User (has lands):**
- NIDA: `1199780123456789` 
- Password: `seller123`

**Buyer User (no lands initially):**
- NIDA: `1198765432109876`
- Password: `buyer123`

### Features Available After Setup
- Both regular users can buy AND sell land (bidirectional trading)
- Admin can verify users and approve transactions
- QR code generation for land sales
- Blockchain hash tracking
- Complete land transfer workflow

## Troubleshooting
If you still get authentication errors after running the scripts, check that:
1. The Neon integration is properly connected
2. The database scripts executed successfully without errors
3. The environment variables are correctly set
