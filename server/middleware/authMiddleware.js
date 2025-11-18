import jwt from 'jsonwebtoken';
import { verifyToken, createClerkClient } from '@clerk/backend';
import Company from '../models/Company.js';
import User from '../models/User.js';

export const protectCompany = async (req, res, next) => {
  const token = req.headers.token
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const company = await Company.findById(decoded.id).select('-password')
    if (!company) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.company = company
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: 'Unauthorized' })
  }
}

const parseAuthorizedParties = () => {
  if (!process.env.CLERK_JWT_AUTHORIZED_PARTIES) return undefined
  return process.env.CLERK_JWT_AUTHORIZED_PARTIES.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// Helper function to extract email from Clerk token or API
const extractEmailFromClerk = async (verified) => {
  let email = ''
  
  // First, try to extract from JWT token
  if (verified.email) {
    email = verified.email
  } else if (verified.primary_email_address) {
    email = verified.primary_email_address.email_address || verified.primary_email_address
  } else if (verified.email_addresses && verified.email_addresses.length > 0) {
    email = typeof verified.email_addresses[0] === 'string' 
      ? verified.email_addresses[0] 
      : verified.email_addresses[0]?.email_address || ''
  }
  
  // If email is still not found, fetch from Clerk API
  if (!email && process.env.CLERK_SECRET_KEY) {
    try {
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
      const clerkUser = await clerkClient.users.getUser(verified.sub)
      
      if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
        // Get primary email or first verified email
        const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
        email = primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || ''
      }
      
      // Also update name and image from Clerk API if not in token
      if (!verified.first_name && !verified.name) {
        verified.first_name = clerkUser.firstName || ''
        verified.last_name = clerkUser.lastName || ''
      }
      if (!verified.image_url && !verified.picture) {
        verified.image_url = clerkUser.imageUrl || ''
      }
    } catch (clerkError) {
      console.error('Error fetching user from Clerk API:', clerkError.message)
    }
  }
  
  return email
}

export const protectUser = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY is not set in environment variables')
    return res.status(500).json({ message: 'Server configuration error' })
  }

  try {
    // Build verification options
    const verifyOptions = {
      secretKey: process.env.CLERK_SECRET_KEY,
    }

    // Add optional parameters only if they exist
    if (process.env.CLERK_JWT_AUDIENCE) {
      verifyOptions.audience = process.env.CLERK_JWT_AUDIENCE
    }

    const authorizedParties = parseAuthorizedParties()
    if (authorizedParties) {
      verifyOptions.authorizedParties = authorizedParties
    }

    const verified = await verifyToken(token, verifyOptions)

    if (!verified || !verified.sub) {
      return res.status(401).json({ message: 'Invalid token: Missing user ID' })
    }

    let user = await User.findById(verified.sub)
    
    // If user exists but has temporary email, try to update with real email from Clerk
    if (user && user.email && user.email.includes('@temp.clerk')) {
      try {
        const email = await extractEmailFromClerk(verified)
        
        // Update user if we found a real email
        if (email && !email.includes('@temp.clerk')) {
          user.email = email
          await user.save()
          console.log('Updated user email from temporary to:', email)
        }
      } catch (updateError) {
        console.error('Error updating user email:', updateError.message)
      }
    }
    
    if (!user) {
      // Create user if they don't exist (in case webhook hasn't fired yet)
      try {
        // Extract email from Clerk token or API
        let email = await extractEmailFromClerk(verified)
        
        // Extract name
        const firstName = verified.first_name || verified.given_name || ''
        const lastName = verified.last_name || verified.family_name || ''
        let name = verified.name || verified.username || ''
        if (!name && (firstName || lastName)) {
          name = `${firstName} ${lastName}`.trim()
        }
        if (!name) {
          name = email ? email.split('@')[0] : 'User'
        }
        
        // Extract image
        let image = verified.image_url || verified.picture || verified.avatar_url || ''
        // If no image, use a default placeholder
        if (!image) {
          image = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random'
        }
        
        // Ensure email is not empty (required field)
        if (!email) {
          // Generate a temporary email if not available
          email = `user_${verified.sub}@temp.clerk`
          console.warn(`No email found for user ${verified.sub}, using temporary email`)
        }
        
        user = await User.create({
          _id: verified.sub,
          email: email,
          name: name,
          image: image,
          resume: '',
        })
        console.log('Created new user:', verified.sub, 'Email:', email, 'Name:', name)
      } catch (createError) {
        console.error('Error creating user:', createError)
        // Log the verified object to help debug
        console.error('Verified token data:', JSON.stringify(verified, null, 2))
        return res.status(401).json({ message: 'User not found and could not be created: ' + (createError.message || 'Validation failed') })
      }
    }

    req.user = user
    req.auth = verified
    next()
  } catch (error) {
    console.error('Token verification error:', error.message || error)
    // Provide more specific error messages
    if (error.message?.includes('JWT')) {
      return res.status(401).json({ message: 'Invalid token format' })
    }
    if (error.message?.includes('secret')) {
      return res.status(500).json({ message: 'Server authentication configuration error' })
    }
    return res.status(401).json({ message: 'Authentication failed: ' + (error.message || 'Invalid token') })
  }
}