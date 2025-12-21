import React, { useState } from "react"
import { useAppContext } from "../context/AppContext"
import toast from "react-hot-toast"

const Login = () => {
	const [state, setState] = useState("login")
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const { axios, setToken } = useAppContext()

	const handleSubmit = async e => {
		e.preventDefault()
		setIsLoading(true)

		const url = state === "login" ? "/api/user/login" : "/api/user/register"
		const payload =
			state === "login" ? { email, password } : { name, email, password }

		try {
			const { data } = await axios.post(url, payload)
			if (data.success) {
				setToken(data.token)
				localStorage.setItem("token", data.token)
				toast.success(state === "login" ? "Успешный вход!" : "Аккаунт создан!")
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			console.error("Login error:", error)
			toast.error(error.response?.data?.message || "Ошибка сервера")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className='min-h-screen flex items-center justify-center w-full px-4 py-12 overflow-hidden relative'>
			<div className='absolute inset-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/70 to-indigo-900/80' />
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.2),transparent_50%)]' />
				<div className='absolute inset-0'>
					<div className='absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-xl animate-blob'></div>
					<div className='absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-transparent rounded-full blur-xl animate-blob animation-delay-2000ms'></div>
					<div className='absolute bottom-40 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-full blur-xl animate-blob animation-delay-4000ms'></div>
				</div>
			</div>

			<form
				className='flex w-full flex-col max-w-96 bg-white/20 backdrop-blur-xl shadow-3xl rounded-3xl border border-white/30 p-8 space-y-8 relative z-10'
				onSubmit={handleSubmit}>
				{/* Логотип */}
				<div className='mx-auto mb-8'>
					<div className='mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/30 shadow-2xl'>
						<svg
							className='h-10 w-10 text-white/90 drop-shadow-lg'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
							/>
						</svg>
					</div>
				</div>

				<div className='text-center'>
					<h2 className='text-4xl font-medium text-white/95 mb-3 drop-shadow-lg'>
						{state === "login" ? "Вход" : "Регистрация"}
					</h2>
					<p className='text-lg text-white/80 drop-shadow-md'>
						{state === "login"
							? "Введите email и пароль для входа"
							: "Создайте аккаунт за минуту"}
					</p>
				</div>

				{/* Имя только для регистрации */}
				{state === "register" && (
					<div className='space-y-2'>
						<label className='block font-medium text-white/90 text-sm'>
							Имя
						</label>
						<input
							placeholder='Введите ваше имя'
							className='mt-1 rounded-2xl ring-1 ring-white/20 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0 outline-none px-4 py-3 w-full bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 hover:border-white/40'
							type='text'
							value={name}
							onChange={e => setName(e.target.value)}
							required
						/>
					</div>
				)}

				{/* Email */}
				<div className='space-y-2'>
					<label className='block font-medium text-white/90 text-sm'>
						Email
					</label>
					<input
						placeholder='your@email.com'
						className='mt-1 rounded-2xl ring-1 ring-white/20 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0 outline-none px-4 py-3 w-full bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 hover:border-white/40'
						type='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
				</div>

				{/* Пароль */}
				<div className='space-y-2'>
					<label className='block font-medium text-white/90 text-sm'>
						Пароль
					</label>
					<input
						placeholder='••••••••'
						className='mt-1 rounded-2xl ring-1 ring-white/20 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0 outline-none px-4 py-3 pr-12 w-full bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 hover:border-white/40'
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
					/>
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className={`py-4 w-full cursor-pointer rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 transform focus:outline-none focus:ring-4 focus:ring-indigo-400/50 ${
						isLoading
							? "bg-gray-500/50 cursor-not-allowed"
							: "bg-gradient-to-r from-indigo-500/90 via-purple-600/90 to-pink-500/90 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white border border-white/30 backdrop-blur-md"
					}`}>
					{isLoading ? (
						<div className='flex items-center justify-center'>
							<svg
								className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
								fill='none'
								viewBox='0 0 24 24'>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								/>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								/>
							</svg>
							Подождите...
						</div>
					) : state === "register" ? (
						"Создать аккаунт"
					) : (
						"Войти"
					)}
				</button>

				<p className='text-center py-4 text-sm text-white/70'>
					{state === "register" ? "Уже есть аккаунт? " : "Нет аккаунта? "}
					<button
						type='button'
						onClick={() => setState(state === "login" ? "register" : "login")}
						className='font-semibold text-indigo-300 hover:text-indigo-200 hover:underline transition-all duration-300'>
						{state === "register" ? "Войти" : "Зарегистрироваться"}
					</button>
				</p>

				<p className='text-xs text-center text-white pt-4'>
					🔒 Безопасно • Конфиденциально • Быстро
				</p>
			</form>

			{/* ✅ Фикс 3: Обычный style без jsx */}
			<style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000ms { animation-delay: 2s; }
        .animation-delay-4000ms { animation-delay: 4s; }
      `}</style>
		</main>
	)
}

export default Login
