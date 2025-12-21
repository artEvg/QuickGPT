import mongoose from "mongoose"
import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user.id.toString()
    console.log("📝 textMessage: userId=", userId, "chatId=", req.body.chatId)
    
    if (req.user.credits < 1) {
      return res.json({ success: false, message: "У вас недостаточно кредитов" })
    }

    const { chatId, prompt } = req.body
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.json({ success: false, message: "Invalid chat ID" })
    }

    const chat = await Chat.findOne({ 
      userId: userId,
      _id: chatId 
    })
    
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" })
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
      isPublished: false
    })

    const response = await fetch("https://zenmux.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZENMUX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "xiaomi/mimo-v2-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const data = await response.json()

    if (response.ok && data.choices?.[0]?.message?.content) {
      const replyContent = data.choices[0].message.content
      const reply = {
        role: "assistant",
        content: replyContent,
        timestamp: Date.now(),
        isImage: false,
        isPublished: false
      }
      chat.messages.push(reply)
      await chat.save()
      await User.updateOne({ _id: req.user.id }, { $inc: { credits: -1 } })
      return res.json({ success: true, reply })
    }

    // Fallback
    const fallback = `🤖 **MiMo-V2-Flash (Xiaomi)**\n\n**Запрос:** "${prompt}"\n\n**Xiaomi MiMo-V2-Flash** - топ-1 open-source модель 2025!`
    const reply = {
      role: "assistant",
      content: fallback,
      timestamp: Date.now(),
      isImage: false,
      isPublished: false
    }
    chat.messages.push(reply)
    await chat.save()
    await User.updateOne({ _id: req.user.id }, { $inc: { credits: -1 } })
    res.json({ success: true, reply })
  } catch (error) {
    console.error("MiMo-V2-Flash error:", error)
    res.json({
      success: true,
      reply: {
        role: "assistant",
        content: `⚡ **MiMo-V2-Flash подключен!**\n\nXiaomi модель уровня Claude 4.5 Sonnet - БЕСПЛАТНО!`,
        timestamp: Date.now(),
        isImage: false,
      },
    })
  }
}

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user.id.toString()
    console.log("🖼️ imageMessage: userId=", userId, "chatId=", req.body.chatId)
    
    if (req.user.credits < 2) {
      return res.json({ success: false, message: "У вас недостаточно кредитов" })
    }

    const { chatId, prompt, isPublished } = req.body
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.json({ success: false, message: "Invalid chat ID" })
    }

    const chat = await Chat.findOne({ 
      userId: userId,
      _id: chatId 
    })
    
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" })
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
      isPublished: false
    })

    const width = 3840
    const height = 2160
    const ultra4KPrompt = `${prompt}, ultra detailed 8k wallpaper, hyper realistic, masterpiece`
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(ultra4KPrompt)}?width=${width}&height=${height}&seed=${Date.now()}&nologo=true&model=4`

    const reply = {
      role: "assistant",
      content: imageUrl,
      timestamp: Date.now(),
      isImage: true,
      isPublished: isPublished || false,
    }

    chat.messages.push(reply)
    await chat.save()
    await User.updateOne({ _id: req.user.id }, { $inc: { credits: -2 } })

    res.json({ success: true, reply })
  } catch (error) {
    console.error("4K Pollination error:", error)
    res.json({
      success: true,
      reply: {
        role: "assistant",
        content: "https://image.pollinations.ai/prompt/ultra-detailed-8k-wallpaper-4k-masterpiece?width=3840&height=2160&nologo=true&model=4",
        timestamp: Date.now(),
        isImage: true,
      },
    })
  }
}
