import mongoose from "mongoose"
import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"

export const textMessageController = async (req, res) => {
	const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

	const isTransientError = (data, status) => {
		const msg = data?.error?.message || data?.message || ""
		return (
			status === 429 ||
			status === 502 ||
			status === 503 ||
			msg.includes("访问量过大") ||
			msg.includes("请您稍后再试") ||
			msg.includes("1305") ||
			msg.toLowerCase().includes("rate limit") ||
			msg.toLowerCase().includes("too many requests") ||
			msg.toLowerCase().includes("temporarily unavailable")
		)
	}

	const requestModel = async ({ model, messages, timeoutMs = 12000 }) => {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

		try {
			const response = await fetch("https://api.ofox.ai/v1", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.ZENMUX_API_KEY}`,
					"Content-Type": "application/json",
				},
				signal: controller.signal,
				body: JSON.stringify({
					model,
					messages,
					temperature: 0.7,
					max_tokens: 1000,
				}),
			})

			const data = await response.json().catch(() => ({}))
			return { response, data }
		} catch (error) {
			if (error?.name === "AbortError") {
				return {
					response: null,
					data: {
						error: {
							message: "Request timed out",
							code: "TIMEOUT",
						},
					},
				}
			}

			return {
				response: null,
				data: {
					error: {
						message: error?.message || "Network error",
						code: "NETWORK_ERROR",
					},
				},
			}
		} finally {
			clearTimeout(timeoutId)
		}
	}

	try {
		const userId = req.user.id.toString()
		const { chatId, prompt } = req.body

		if (req.user.credits < 1) {
			return res.json({
				success: false,
				message: "У вас недостаточно кредитов",
			})
		}

		if (!prompt?.trim()) {
			return res.json({
				success: false,
				message: "Пустой запрос",
			})
		}

		if (!mongoose.Types.ObjectId.isValid(chatId)) {
			return res.json({ success: false, message: "Invalid chat ID" })
		}

		const chat = await Chat.findOne({ userId, _id: chatId })
		if (!chat) {
			return res.json({ success: false, message: "Chat not found" })
		}

		chat.messages.push({
			role: "user",
			content: prompt.trim(),
			timestamp: Date.now(),
			isImage: false,
			isPublished: false,
		})

		const messages = [
			{
				role: "system",
				content:
					"Ты полезный универсальный ассистент. Отвечай по-русски. Помогай с погодой, кодом, общением и другими вопросами. Не выдумывай факты. Если точной информации нет, честно скажи об этом.",
			},
			...chat.messages
				.filter(m => typeof m.content === "string" && m.content.trim())
				.map(m => ({
					role: m.role,
					content: m.content,
				})),
		]

		const result = await requestModel({
			model: "z-ai/glm-4.7-flash:free",
			messages,
			timeoutMs: 50000,
		})

		const replyContent = result?.data?.choices?.[0]?.message?.content?.trim()

		if (!result.response?.ok || !replyContent) {
			return res.json({
				success: false,
				message:
					result?.data?.error?.message || "Не удалось получить ответ от модели",
			})
		}

		const reply = {
			role: "assistant",
			content: replyContent,
			timestamp: Date.now(),
			isImage: false,
			isPublished: false,
		}

		chat.messages.push(reply)
		await chat.save()
		await User.updateOne({ _id: req.user.id }, { $inc: { credits: -1 } })

		return res.json({ success: true, reply })
	} catch (error) {
		console.error("Assistant error:", error)
		return res.json({
			success: false,
			message: error?.message || "Ошибка при генерации ответа",
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

    const enhancedPrompt = enhanceImagePrompt(prompt)
    
    console.log("🖼️ Enhanced prompt:", enhancedPrompt.slice(0, 100) + "...")

    const width = 3840
    const height = 2160
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${Date.now()}&nologo=true&model=4`

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
        content: "https://image.pollinations.ai/prompt/hyper-realistic-portrait-of-a-cat-in-cyberpunk-city-8k-ultra-detailed?width=3840&height=2160&nologo=true&model=4",
        timestamp: Date.now(),
        isImage: true,
      },
    })
  }
}

const enhanceImagePrompt = (prompt) => {
  const baseEnhancers = [
    "hyper realistic", "photorealistic", "ultra detailed", 
    "8k wallpaper", "professional photography", 
    "cinematic lighting", "sharp focus", "masterpiece"
  ]

  const isRussian = /[а-яё]/i.test(prompt)
  const isEnglish = /[a-z]/i.test(prompt)

  let enhanced = prompt

  if (isRussian && !isEnglish) {
    enhanced = translateToEnglish(prompt)
  }

  enhanced += ", " + baseEnhancers.join(", ")
  
  enhanced += getStyleEnhancers(prompt)
  
  return enhanced.slice(0, 200)
}

const translateToEnglish = (ruPrompt) => {
  const translations = {
    // 🐾 ЖИВОТНЫЕ
    "кот": "cat", "кошка": "cat", "котёнок": "kitten",
    "собака": "dog", "щенок": "puppy", "лошадь": "horse",
    "птица": "bird", "рыба": "fish", "волк": "wolf",
    "медведь": "bear", "лиса": "fox", "заяц": "rabbit",

    // 👨‍👩‍👧‍👦 ЛЮДИ
    "мальчик": "boy", "девочка": "girl", "девушка": "young woman",
    "мужчина": "man", "женщина": "woman", "ребёнок": "child",
    "старик": "old man", "старуха": "old woman", "семья": "family",

    // 🏔️ ПРИРОДА
    "горы": "mountains", "гора": "mountain", "альпы": "Alps",
    "лес": "forest", "дерево": "tree", "река": "river",
    "море": "ocean", "пляж": "beach", "озеро": "lake",
    "водопад": "waterfall", "небо": "sky", "облака": "clouds",
    "закат": "sunset", "рассвет": "sunrise", "луна": "moon",

    // 🚂 ТРАНСПОРТ
    "поезд": "train", "машина": "car", "мотоцикл": "motorcycle",
    "самолёт": "airplane", "корабль": "ship", "велосипед": "bicycle",
    "танк": "tank", "ракета": "rocket", "вертолёт": "helicopter",

    // 🏠 ОБЪЕКТЫ
    "дом": "house", "замок": "castle", "дворец": "palace",
    "город": "city", "улица": "street", "мост": "bridge",
    "башня": "tower", "храм": "temple", "церковь": "church",

    // 🎨 ПРОФЕССИИ/ДЕЙСТВИЯ
    "фотограф": "photographer", "художник": "artist", 
    "музыкант": "musician", "воин": "warrior", "волшебник": "wizard",

    // 🌈 СТИЛИ/ЖАНРЫ
    "портрет": "portrait", "пейзаж": "landscape", "натюрморт": "still life",
    "киберпанк": "cyberpunk", "футуристический": "futuristic",
    "фэнтези": "fantasy", "реализм": "realism", "аниме": "anime",
    "стимпанк": "steampunk", "барокко": "baroque", "минимализм": "minimalism"
  }

  let enPrompt = ruPrompt.toLowerCase()
  for (const [ru, en] of Object.entries(translations)) {
    if (en) {
      enPrompt = enPrompt.replace(new RegExp(ru, 'gi'), en)
    }
  }
  
  if (ruPrompt.includes("горы") || ruPrompt.includes("фотограф")) {
    enPrompt = enPrompt.replace(/\b(?:house|building|дом|здание)\b/gi, "")
  }
  
  return enPrompt.charAt(0).toUpperCase() + enPrompt.slice(1)
}

const getStyleEnhancers = (prompt) => {
  const styles = {
    cyberpunk: ["neon lights", "rainy night", "holograms"],
    portrait: ["studio lighting", "dramatic shadows", "high contrast"],
    landscape: ["golden hour", "atmospheric perspective", "volumetric lighting"],
    futuristic: ["sci-fi", "metallic surfaces", "energy glow"],
    fantasy: ["ethereal glow", "magical aura", "mystical atmosphere"]
  }

  const lowerPrompt = prompt.toLowerCase()
  for (const [theme, enhancers] of Object.entries(styles)) {
    if (lowerPrompt.includes(theme)) {
      return ", " + enhancers.join(", ")
    }
  }
  
  return ""
}