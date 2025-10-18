import mongoose from "mongoose";

// Function to connect to the MongoDB data

const connectDB = async () => {
     mongoose.connection.on('connected', () => console.log('DB1 connected'))
     
     await mongoose.connect(process.env.MONGODB_URI)
}

export default connectDB
 