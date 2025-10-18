// Vercel-compatible webhook handler
import { Webhook } from "svix";
import mongoose from "mongoose";
import 'dotenv/config';

// Define User schema inline to avoid import issues
const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resume: { type: String },
    image: { type: String, required: true }
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Database connection function
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Webhook received on Vercel');
        
        // Connect to database
        await connectDB();
        
        // Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verify the webhook signature
        const payload = await whook.verify(req.body, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        console.log('Webhook verified successfully');

        // Getting data from verified payload
        const { data, type } = payload;

        // Switch case for different events
        switch (type) {
            case 'user.created': {
                console.log('User created event received:', data);
                
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    image: data.image_url || '',
                    resume: ''
                };

                console.log('Creating user with data:', userData);
                
                try {
                    const newUser = await User.create(userData);
                    console.log('User created successfully:', newUser);
                    return res.status(200).json({ success: true, message: 'User created successfully' });
                } catch (dbError) {
                    console.error('Database error creating user:', dbError);
                    return res.status(500).json({ success: false, message: 'Database error creating user' });
                }
            }

            case 'user.updated': {
                console.log('User updated event received:', data);
                
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    image: data.image_url || '',
                };

                console.log('Updating user with data:', userData);
                
                try {
                    const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
                    console.log('User updated successfully:', updatedUser);
                    return res.status(200).json({ success: true, message: 'User updated successfully' });
                } catch (dbError) {
                    console.error('Database error updating user:', dbError);
                    return res.status(500).json({ success: false, message: 'Database error updating user' });
                }
            }

            case 'user.deleted': {
                console.log('User deleted event received:', data);
                
                try {
                    await User.findByIdAndDelete(data.id);
                    console.log('User deleted successfully');
                    return res.status(200).json({ success: true, message: 'User deleted successfully' });
                } catch (dbError) {
                    console.error('Database error deleting user:', dbError);
                    return res.status(500).json({ success: false, message: 'Database error deleting user' });
                }
            }

            default:
                console.log('Unhandled webhook event type:', type);
                return res.status(200).json({ success: true, message: 'Event received but not handled' });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(400).json({ success: false, message: 'Webhook verification failed', error: error.message });
    }
}
