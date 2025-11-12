import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhook.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'

// Initialize Express
const app = express()

// connect to database
await connectDB()
await connectCloudinary()

//Middlewares
app.use(cors())
app.use(express.json())

//Routes
app.post('/webhooks', 
  express.raw({ type: 'application/json' }), 
  clerkWebhooks
)
app.use('/api/company', companyRoutes)



//PORT
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})