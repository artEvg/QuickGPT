import React, { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext.jsx"
import { assets } from "../assets/assets.js"
import { DateTime } from "luxon"

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
	const { chats, setSelectedChat, theme, setTheme, user, navigate } =
		useAppContext()
	const [search, setSearch] = useState("")

	return (
		<div
			className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-10 ${
				isMenuOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
			}`}>
			{/* Logo */}
			<img
				src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
				alt='Logo'
				className='w-full max-w-48'
			/>

			{/* Button New Chat */}
			<button className='flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer'>
				<span className='mr-2 text-xl'>+</span> Новый чат
			</button>

			{/* Search */}
			<div className='flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md'>
				<img
					src={assets.search_icon}
					alt='search'
					className='w-4 not-dark:invert'
				/>
				<input
					onChange={e => setSearch(e.target.value)}
					value={search}
					type='text'
					placeholder='Введите название чата'
					className='text-sm placeholder:text-gray-400 outline-none flex-1'
				/>
			</div>

			{/* Chats */}
			{chats.length > 0 && (
				<p className='mt-4 text-md font-semibold accent-text'>Недавнее</p>
			)}

			<div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3'>
				{chats
					.filter(chat =>
						chat.messages[0]
							? chat.messages[0]?.content
									.toLowerCase()
									.includes(search.toLowerCase())
							: chat.name?.toLowerCase().includes(search.toLowerCase())
					)
					.map(chat => (
						<div
							key={chat._id}
							className='p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group hover:bg-gray-50 dark:hover:bg-[#57317C]/20 transition-colors'
							onClick={() => {
								navigate("/")
								setSelectedChat(chat)
								setIsMenuOpen(false)
							}}>
							<div>
								<p className='truncate w-full'>
									{chat.messages.length > 0
										? chat.messages[0].content.slice(0, 32)
										: chat.name || "Новый чат"}
								</p>
								<p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>
									{DateTime.fromISO(chat.updatedAt).toRelative()}
								</p>
							</div>
							<img
								src={assets.bin_icon}
								alt='delete'
								className='hidden group-hover:block w-4 cursor-pointer not-dark:invert opacity-70 hover:opacity-100 transition-opacity'
							/>
						</div>
					))}
			</div>

			<div>
				{/* Images */}
				<div
					onClick={() => {
						navigate("/community")
						setIsMenuOpen(false)
					}}
					className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all'>
					<img
						src={assets.gallery_icon}
						alt='gallery'
						className='w-4.5 not-dark:invert'
					/>
					<div className='flex flex-col text-sm'>
						<p className='accent-text font-semibold'>Галерея</p>
					</div>
				</div>

				{/* Credit */}
				<div
					onClick={() => {
						navigate("/credits")
						setIsMenuOpen(false)
					}}
					className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all'>
					<img
						src={assets.diamond_icon}
						alt='credits'
						className='w-4.5 dark:invert'
					/>
					<div className='flex flex-col text-sm'>
						<p className='font-semibold'>Кредиты: {user?.credits || 0}</p>
						<p className='text-sm text-gray-400'>
							Приобретите кредиты для использования QuickGPT
						</p>
					</div>
				</div>
			</div>

			{/* Dark Mode */}
			<div className='flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all'>
				<div className='flex items-center gap-2 text-sm'>
					<img
						src={assets.theme_icon}
						alt='theme'
						className='w-4 not-dark:invert'
					/>
					<p className='font-semibold'>Тёмный режим</p>
				</div>
				<label className='relative inline-flex cursor-pointer'>
					<input
						onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
						type='checkbox'
						className='sr-only peer'
						checked={theme === "dark"}
					/>
					<div className='w-9 h-5 bg-gray-400 rounded-full peer peer-checked:bg-purple-600 transition-all'></div>
					<span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
				</label>
			</div>

			{/* User */}
			<div className='flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group hover:scale-103 transition-all'>
				<img
					src={assets.user_icon}
					alt='user'
					className='w-7 rounded-full'
				/>
				<p className='flex-1 font-medium text-sm dark:text-primary truncate'>
					{user ? user.name : "Войдите в Аккаунт"}
				</p>
				{user && (
					<img
						src={assets.logout_icon}
						alt='logout'
						className='h-5 cursor-pointer hidden not-dark:invert group-hover:block opacity-70 hover:opacity-100 transition-opacity'
					/>
				)}
			</div>

			{/* Close button */}
			<img
				onClick={() => setIsMenuOpen(false)}
				src={assets.close_icon}
				className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert hover:opacity-70 transition-opacity'
				alt='close'
			/>
		</div>
	)
}

export default Sidebar
