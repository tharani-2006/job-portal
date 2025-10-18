// Simple health check endpoint for Vercel
export default async function handler(req, res) {
    return res.status(200).json({ 
        success: true, 
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
}
