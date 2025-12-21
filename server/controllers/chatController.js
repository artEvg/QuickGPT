import Chat from "../models/Chat.js"

export const createChat = async (req, res) => {
	try {
		console.log("🆕 createChat для:", req.user.email)

		const chatData = {
			userId: req.user.id.toString(),
			userName: req.user.name,
			name: "Новый чат",
			messages: [],
		}

		const newChat = await Chat.create(chatData)
		console.log("✅ Чат создан:", newChat._id)

		res.json({
			success: true,
			chat: newChat,
			message: "Чат успешно создан",
		})
	} catch (error) {
		console.error("❌ createChat error:", error)
		res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}


export const getChats = async (req, res) => {
	try {
		console.log("📋 getChats для:", req.user.email)

		const chats = await Chat.find({
			userId: req.user.id.toString(),
		}).sort({ updatedAt: -1 })

		console.log("📋 Найдено чатов:", chats.length)

		res.json({
			success: true,
			chats,
		})
	} catch (error) {
		console.error("❌ getChats error:", error)
		res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}

// ✅ deleteChat
export const deleteChat = async (req, res) => {
	try {
		const { chatId } = req.body
		const result = await Chat.deleteOne({
			_id: chatId,
			userId: req.user.id.toString(),
		})

		res.json({
			success: true,
			message: `Чат удален (${result.deletedCount})`,
		})
	} catch (error) {
		console.error("❌ deleteChat error:", error)
		res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}
