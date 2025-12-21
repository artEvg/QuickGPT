import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js"
import userRouter from "./routes/userRoutes.js"
import chatRouter from "./routes/chatRoutes.js"
import messageRouter from "./routes/messageRoutes.js"
import creditRouter from "./routes/creditRoutes.js"

const app = express()
await connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get("/", (req, res) => {
	res.send("Сервер работает!")
})
app.use("/api/user", userRouter)
app.use("/api/chat", chatRouter)
app.use("/api/message", messageRouter)
app.use("/api/credit", (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1]

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			req.user = { _id: decoded.id }
			console.log("🔓 Токен OK, userId:", decoded.id)
		} catch (error) {
			console.log("🔓 Токен недействителен")
		}
	}

	next()
})
app.use("/api/credit", creditRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log(`Сервер запущен на ${PORT} порту`)
})
