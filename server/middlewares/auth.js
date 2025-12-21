import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
	try {
		let token
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1]
		} else {
			return res.status(401).json({
				success: false,
				message: "Нет токена авторизации",
			})
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		console.log("✅ Decoded:", decoded.id)

		const user = await User.findById(decoded.id).select("-password")

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Пользователь не найден",
			})
		}

		req.user = {
			id: user._id,
			name: user.name,
			email: user.email,
			credits: user.credits,
		}

		console.log("✅ User authorized:", req.user.email)
		next()
	} catch (error) {
		console.error("❌ Protect error:", error.message)
		res.status(401).json({
			success: false,
			message: "Токен не валидный",
		})
	}
}
