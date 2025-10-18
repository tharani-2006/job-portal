import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req,res) => {
    try {
        console.log('Webhook received, headers:', req.headers);
        console.log('Webhook body type:', typeof req.body);
        
        // Create  a Svix instance  with clerk webhook secret.
        const whook = new Webhook (process.env.CLERK_WEBHOOK_SECRET)   

        //Verifying Headers
        const payload = await whook.verify(req.body,{
            "svix-id" : req.headers["svix-id"],
            "svix-timestamp" : req.headers["svix-timestamp"],
            "svix-signature" : req.headers["svix-signature"]
        })

        // Getting data from verified payload
        const {data ,type}= payload

        //Switch case for different events
        switch (type) {
            case 'user.created':{
                console.log('User created event received:', data);
                const userData = {
                    _id : data.id,
                    email :data.email_addresses[0].email_address,
                    name : data.first_name + " " +data.last_name,
                    image : data.image_url,
                    resume : ''
                }
                console.log('Creating user with data:', userData);
                const newUser = await User.create(userData);
                console.log('User created successfully:', newUser);
                res.json({success: true, message: 'User created'})
                break;
            }

            case 'user.updated':{
                console.log('User updated event received:', data);
                const userData = {
                    email :data.email_addresses[0].email_address,
                    name : data.first_name + " " +data.last_name,
                    image : data.image_url,
                }
                console.log('Updating user with data:', userData);
                const updatedUser = await User.findByIdAndUpdate(data.id,userData, {new: true})
                console.log('User updated successfully:', updatedUser);
                res.json({success: true, message: 'User updated'})
                break;
            }

            case 'user.deleted':{
                console.log('User deleted event received:', data);
                const deletedUser = await User.findByIdAndDelete(data.id)
                console.log('User deleted successfully:', deletedUser);
                res.json({success: true, message: 'User deleted'})
                break;
            } 
            default : 
                console.log('Unhandled webhook event type:', type);
                res.json({success: true, message: 'Event received but not handled'})
            break;

        }

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({success:false, message:'Webhook Error', error: error.message})
    }
}