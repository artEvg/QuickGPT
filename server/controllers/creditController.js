import Transaction from "../models/Transaction.js"
import User from "../models/User.js"
import axios from "axios"

const plans = [
	{
		_id: "basic",
		name: "Стандарт",
		price: 499,
		credits: 100,
		features: [
			"✨ 100 мощных текстовых запросов",
			"🖼️ 50 креативных генераций изображений",
			"🛡️ Надежная поддержка 24/7",
			"🚀 Полный доступ к базовым ИИ-моделям",
		],
	},
	{
		_id: "pro",
		name: "Премиум",
		price: 999,
		credits: 500,
		features: [
			"✨ 500 генераций мощного текста",
			"🖼️ 200 креативных изображений",
			"⚡ Приоритетная поддержка",
			"🚀 Доступ к PRO-моделям",
			"⏱️ Ускоренная скорость ответа",
		],
	},
	{
		_id: "premium",
		name: "Ультра",
		price: 1499,
		credits: 1000,
		features: [
			"✨ 1000 генераций мощного текста",
			"🖼️ 500 креативных изображений",
			"👑 VIP-поддержка 24/7",
			"⭐ Доступ к премиум-моделям",
			"💼 Личный менеджер аккаунта",
		],
	},
]

export const getPlans = async (req, res) => {
	try {
		const pendingTransactions = await Transaction.find({
			isPaid: false,
			yookassaPaymentId: { $exists: true },
		})
			.populate("userId")
			.sort({ createdAt: -1 })
			.limit(10)

		console.log(`🔍 Найдено НЕОПЛАЧЕННЫХ: ${pendingTransactions.length}`)

		const shopId = "1233754"
		const secretKey = "test_Lrnmshbrf0XxlwtlgId-Fv7q2kCZebvKr7sVkK60sxg"

		for (let transaction of pendingTransactions) {
			console.log(
				`🔍 Проверяем: ${transaction._id
					.toString()
					.slice(-6)} | Платеж: ${transaction.yookassaPaymentId.slice(0, 8)}`
			)

			try {
				const paymentStatus = await axios.get(
					`https://api.yookassa.ru/v3/payments/${transaction.yookassaPaymentId}`,
					{ auth: { username: shopId, password: secretKey } }
				)

				console.log(
					`✅ СТАТУС: ${paymentStatus.data.status} | План: ${transaction.planId}`
				)

				if (paymentStatus.data.status === "succeeded") {
					transaction.isPaid = true
					transaction.status = "completed"
					await transaction.save()

					await User.findByIdAndUpdate(transaction.userId._id, {
						$inc: { credits: transaction.credits },
					})

					console.log(
						`🎉 ✅ ✅ ✅ ПОБЕДА! isPaid=true | +${transaction.credits} кредитов | User: ${transaction.userId._id}`
					)
				}
			} catch (error) {
				console.log(`❌ Платеж не найден: ${transaction.yookassaPaymentId}`)
			}
		}

		res.json({ success: true, plans })
	} catch (error) {
		console.error("getPlans error:", error)
		res.json({ success: true, plans })
	}
}

export const purchasePlan = async (req, res) => {
	try {
		const { planId } = req.body
		const userId = req.user._id
		const plan = plans.find(p => p._id === planId)

		if (!plan) {
			return res.status(404).json({ success: false, message: "План не найден" })
		}

		const transaction = await Transaction.create({
			userId,
			planId: plan._id,
			amount: plan.price,
			credits: plan.credits,
			isPaid: false,
			status: "pending",
		})

		const shopId = process.env.YUKASSA_SHOP_ID || "1233754"
		const secretKey =
			process.env.YUKASSA_SECRET_KEY ||
			"test_Lrnmshbrf0XxlwtlgId-Fv7q2kCZebvKr7sVkK60sxg"

		const idempotenceKey = `pay_${transaction._id}_${Date.now()}`

		const paymentData = {
			amount: {
				value: plan.price.toString(),
				currency: "RUB",
			},
			confirmation: {
				type: "redirect",
				return_url: `${
					process.env.BASE_URL || "http://localhost:3000"
				}/dashboard`,
			},
			capture: true,
			description: `План ${plan.name} (${plan.credits} кредитов)`,
			metadata: {
				userId: userId.toString(),
				transactionId: transaction._id.toString(),
			},
		}

		const response = await axios.post(
			`https://api.yookassa.ru/v3/payments`,
			paymentData,
			{
				auth: { username: shopId, password: secretKey },
				headers: {
					"Idempotence-Key": idempotenceKey,
					"Content-Type": "application/json",
				},
			}
		)

		transaction.yookassaPaymentId = response.data.id
		await transaction.save()

		console.log(`✅ Создан платеж ${response.data.id} для плана ${plan.name}`)

		res.json({
			success: true,
			url: response.data.confirmation.confirmation_url,
			transactionId: transaction._id,
		})
	} catch (error) {
		console.error("🚨 ОШИБКА:", error.response?.data || error.message)
		res.status(500).json({
			success: false,
			message: error.response?.data?.description || error.message,
		})
	}
}
