import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
	const navigate = useNavigate()
	const [user, setUser] = useState(null)
	const [chats, setChats] = useState([])
	const [selectedChat, setSelectedChat] = useState(null)
	const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
	const [token, setToken] = useState(localStorage.getItem("token") || null)
	const [loadingUser, setLoadingUser] = useState(true)

	const fetchUser = async () => {
		if (!token) {
			setLoadingUser(false)
			return
		}

		try {
			console.log("🔄 fetchUser started")
			const { data } = await axios.get("/api/user/data", {
				headers: { Authorization: `Bearer ${token}` },
			})

			if (data.success) {
				setUser(data.user)
				console.log("✅ User loaded:", data.user)
			}
		} catch (error) {
			console.error(
				"❌ fetchUser error:",
				error.response?.status,
				error.message
			)
			if (error.response?.status !== 401) {
				toast.error("Ошибка загрузки пользователя")
			}
			setUser(null)
			localStorage.removeItem("token")
			setToken(null)
		} finally {
			setLoadingUser(false)
			console.log("🔄 fetchUser finished")
		}
	}

	const createNewChat = async () => {
		try {
			console.log("🆕 Создание чата...")
			const { data: createData } = await axios.get("/api/chat/create", {
				headers: { Authorization: `Bearer ${token}` },
				timeout: 10000,
			})

			console.log("🆕 ОТВЕТ СОЗДАНИЯ:", createData)
			if (createData.success) {
				console.log("✅ Новый чат создан!")
				// Перезагружаем чаты
				setTimeout(() => fetchUserChats(), 500)
			}
		} catch (error) {
			console.error("❌ createNewChat ERROR:", {
				code: error.code,
				status: error.response?.status,
				message: error.message,
				data: error.response?.data,
			})
			toast.error("Ошибка создания чата")
		}
	}

	const fetchUserChats = async () => {
		try {
			if (!token) return

			console.log("📡 Запрос чатов...")
			const { data } = await axios.get("/api/chat/get", {
				headers: { Authorization: `Bearer ${token}` },
				timeout: 10000,
			})

			console.log("📋 ОТВЕТ ЧАТОВ:", data)
			if (data.success) {
				setChats(data.chats || [])
				console.log("📋 Загружено чатов:", data.chats?.length || 0)

				if ((!data.chats || data.chats.length === 0) && user) {
					console.log("➕ Нет чатов → создаем новый!")
					// ✅ Задержка перед созданием
					setTimeout(() => createNewChat(), 300)
				} else if (data.chats?.length > 0) {
					setSelectedChat(data.chats[0])
					console.log("✅ Выбран чат:", data.chats[0].name)
				}
			}
		} catch (error) {
			console.error("❌ fetchUserChats ERROR:", {
				code: error.code,
				status: error.response?.status,
				message: error.message,
			})
		}
	}

	// Theme
	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark")
		} else {
			document.documentElement.classList.remove("dark")
		}
		localStorage.setItem("theme", theme)
	}, [theme])

	// ✅ Token → User (1)
	useEffect(() => {
		console.log("🔄 Token changed:", !!token)
		if (token) {
			fetchUser()
		} else {
			setUser(null)
			setLoadingUser(false)
		}
	}, [token])

	// ✅ User → Chats (2) - ТОЛЬКО после user!
	useEffect(() => {
		if (user && token) {
			console.log("👤 User готов → загружаем чаты")
			fetchUserChats()
		} else if (!user) {
			setChats([])
			setSelectedChat(null)
		}
	}, [user, token]) // ✅ Зависимости: user + token

	const value = {
		navigate,
		user,
		setUser,
		fetchUser,
		chats,
		setChats,
		selectedChat,
		setSelectedChat,
		theme,
		setTheme,
		createNewChat,
		loadingUser,
		fetchUserChats,
		token,
		setToken,
		axios,
	}

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
