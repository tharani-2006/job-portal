import jwt from 'jsonwebtoken';
import { verifyToken } from '@clerk/backend';
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

export const protectUser = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      audience: process.env.CLERK_JWT_AUDIENCE,
      authorizedParties: parseAuthorizedParties(),
    })

    const user = await User.findById(verified.sub)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    req.auth = verified
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: 'Unauthorized' })
  }
}