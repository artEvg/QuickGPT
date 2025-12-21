import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
	let token = req.headers.authorization

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findById(decoded.id)

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Пользователь не найден",
			})
		}

		req.user = user
		next()
	} catch (error) {
		return res.status(401).json({
			message: "Токен не валидный",
		})
	}
}
