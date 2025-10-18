import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhook.js'

// Initialize Express
const app = express()

// Connect to MongoDB
await connectDB()

//Middlewares
app.use(cors())
app.use(express.json()) // <-- must come before routes

//Routes
app.post('/webhooks', clerkWebhooks)
app.get('/', (req,res) => res.send("API working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Sentry error handling
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())

//PORT
const PORT = process.env.PORT || 5000
app.listen(PORT,()=> console.log(`Server is running on port ${PORT}`))
