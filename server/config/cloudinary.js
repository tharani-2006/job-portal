import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = () => {
  if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Error: Cloudinary environment variables are missing!')
    console.error('Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file')
    return
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  console.log('Cloudinary configured successfully')
}

export default connectCloudinary