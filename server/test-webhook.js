// Test script to verify webhook functionality
// Run this after setting up your environment variables

import 'dotenv/config';
import User from './models/User.js';
import connectDB from './config/db.js';

const testWebhook = async () => {
    try {
        // Check if environment variables are set
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not set in environment variables');
            console.log('Please create a .env file in the server directory with:');
            console.log('MONGODB_URI=your_mongodb_atlas_connection_string');
            process.exit(1);
        }

        if (!process.env.CLERK_WEBHOOK_SECRET) {
            console.error('❌ CLERK_WEBHOOK_SECRET is not set in environment variables');
            console.log('Please add to your .env file:');
            console.log('CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret');
            process.exit(1);
        }

        console.log('✅ Environment variables loaded successfully');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ❌');
        console.log('CLERK_WEBHOOK_SECRET:', process.env.CLERK_WEBHOOK_SECRET ? 'Set ✓' : 'Not set ❌');

        // Connect to database
        await connectDB();
        console.log('Connected to database');

        // Test user data (similar to what Clerk sends)
        const testUserData = {
            _id: 'test_user_123',
            email: 'test@example.com',
            name: 'Test User',
            image: 'https://example.com/image.jpg',
            resume: ''
        };

        console.log('Creating test user...');
        const newUser = await User.create(testUserData);
        console.log('Test user created successfully:', newUser);

        // Don't delete the test user so you can see it in MongoDB
        console.log('Test user created and kept in database for verification');
        console.log('Check your MongoDB Atlas to see the test user');

        console.log('✅ Database connection and user creation working correctly!');
        console.log('🔍 Now test the actual webhook by signing in through Clerk');
        
    } catch (error) {
        console.error('❌ Error testing webhook:', error);
    }
    
    process.exit(0);
};

testWebhook();
