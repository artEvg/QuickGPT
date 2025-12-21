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

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
	res.send("QuickGPT API работает!")
})

app.use("/api/user", userRouter)
app.use("/api/chat", chatRouter)
app.use("/api/message", messageRouter)
app.use("/api/credit", creditRouter)

// ✅ WEBHOOK ЮKASSA
app.post(
	"/api/yookassa-webhook",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		try {
			console.log("🎯 WEBHOOK ПОЛУЧЕН!")
			const event = JSON.parse(req.body.toString())

			if (event.event === "payment.succeeded") {
				const paymentId = event.object.id
				console.log(`🎯 Платеж успешен: ${paymentId}`)

				const Transaction = (await import("../models/Transaction.js")).default
				const User = (await import("../models/User.js")).default

				const transaction = await Transaction.findOne({
					yookassaPaymentId: paymentId,
				}).populate("userId")

				if (transaction && !transaction.isPaid) {
					transaction.isPaid = true
					transaction.status = "completed"
					await transaction.save()

					await User.findByIdAndUpdate(transaction.userId._id, {
						$inc: { credits: transaction.credits },
					})

					console.log(
						`🎉 ✅ УСПЕХ! +${transaction.credits} кредитов → User: ${transaction.userId._id}`
					)
				}
			}

			res.status(200).send("OK")
		} catch (error) {
			console.error("Webhook error:", error)
			res.status(500).send("Error")
		}
	}
)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`🚀 QuickGPT запущен на порту ${PORT}`)
	console.log(
		`📡 Webhook: https://quick-gpt-rho-black.vercel.app/api/yookassa-webhook`
	)
})
