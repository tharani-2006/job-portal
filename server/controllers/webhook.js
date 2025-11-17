import { Webhook } from "svix"
import User from "../models/User.js"

const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

export const clerkWebhooks = async (req, res) => {
  try {
    const payload =
      typeof req.body === "string" ? req.body : req.body?.toString?.() || ""

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    }

    const evt = webhook.verify(payload, headers)
    const { data, type } = evt
    const email = data?.email_addresses?.[0]?.email_address
    const fullName = [data?.first_name, data?.last_name].filter(Boolean).join(" ")

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email,
          name: fullName,
          image: data.image_url,
          resume: "",
        }
        await User.findByIdAndUpdate(data.id, userData, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        })
        break
      }

      case "user.updated": {
        const userData = {
          email,
          name: fullName,
          image: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        break
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id)
        break
      }

      default:
        break
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: "Webhooks Error" })
  }
}
