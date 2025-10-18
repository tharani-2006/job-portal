// Test environment variables in Vercel
import 'dotenv/config';

export default async function handler(req, res) {
    try {
        const envCheck = {
            MONGODB_URI: process.env.MONGODB_URI ? 'Set ✓' : 'Not set ❌',
            CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET ? 'Set ✓' : 'Not set ❌',
            NODE_ENV: process.env.NODE_ENV || 'Not set'
        };

        console.log('Environment variables check:', envCheck);

        return res.status(200).json({
            success: true,
            message: 'Environment variables check',
            env: envCheck,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking environment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking environment',
            error: error.message
        });
    }
}
