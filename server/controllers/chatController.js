import Chat from "../models/Chat.js"

// API for create a new chat
export const createChat = async (req, res) => {
	try {
		const userId = req.user._id
		const chatData = {
			userId,
			messages: [],
			name: "Новый чат",
			userName: req.user.name,
		}
		await Chat.create(chatData)
		res.json({
			success: true,
			message: "Чат успешно создан",
		})
	} catch (error) {
		res.json({
			success: false,
			message: error.message,
		})
	}
}

// API for get all chats
export const getChats = async (req, res) => {
	try {
		const userId = req.user._id
		const chats = await Chat.find({ userId }).sort({ updatedAt: -1 })

		res.json({
			success: true,
			chats,
		})
	} catch (error) {
		res.json({
			success: false,
			message: error.message,
		})
	}
}

// API for delete chat
export const deleteChat = async (req, res) => {
	try {
		const userId = req.user._id
		const { chatId } = req.body
		await Chat.deleteOne({ _id: chatId, userId })

		res.json({
			success: true,
			message: "Чат успешно удален",
		})
	} catch (error) {
		res.json({
			success: false,
			message: error.message,
		})
	}
}
