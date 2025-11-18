import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from root directory first, then server directory
const rootEnvPath = join(__dirname, '../../.env')
const serverEnvPath = join(__dirname, '../.env')

if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath })
  console.log('Loaded .env from root directory')
} else if (existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath })
  console.log('Loaded .env from server directory')
} else {
  console.warn('Warning: No .env file found in root or server directory')
  console.warn('Please create a .env file with your Cloudinary credentials')
}

