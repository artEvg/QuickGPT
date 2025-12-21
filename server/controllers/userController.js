import User from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import Chat from "../models/Chat.js"

// Generate JWT token
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// API to register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body
  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.json({
        success: false,
        message: "Пользователь уже существует",
      })
    }
    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)
    res.json({ success: true, token })
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    })
  }
}

// API to login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) {
        const token = generateToken(user._id)
        return res.json({ success: true, token })
      }
    }
    return res.json({
      success: false,
      message: "Неверный email или пароль",
    })
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    })
  }
}

// API to get user data
export const getUser = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
}

export const getPublishedImages = async (req, res) => {
  try {
    const chats = await Chat.find({
      "messages.isImage": true,
      "messages.isPublished": true
    }).lean();

    const result = chats
      .flatMap(chat => 
        chat.messages
          .filter(msg => 
            msg.isImage === true &&
            msg.isPublished === true && 
            msg.content.includes('pollinations.ai')
          )
          .map(msg => ({
            imageUrl: msg.content,
            userName: chat.userName,
            timestamp: msg.timestamp
          }))
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    console.log(`🎯 НАЙДЕНО: ${result.length} фото (ТОЛЬКО true)`);
    console.log("📸 Первые:", result.slice(0, 2));
    
    res.json({ success: true, image: result });
  } catch (error) {
    console.error('ERROR:', error);
    res.json({ success: false, image: [] });
  }
};
