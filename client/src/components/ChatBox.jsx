import React, { useEffect, useState, useRef, useCallback } from "react"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets"
import Message from "./Message"
import toast from "react-hot-toast"

const ChatBox = () => {
	const { selectedChat, theme, user, axios, token, setUser } = useAppContext()
	const [messages, setMessages] = useState([])
	const [loading, setLoading] = useState(false)
	const [prompt, setPrompt] = useState("")
	const [mode, setMode] = useState("text")
	const [isPublished, setIsPublished] = useState(false)
	const onSubmit = async e => {
  try {
    e.preventDefault()
    if(!user) return toast('Войдите в аккаунт')
    
    setLoading(true)
    const promptCopy = prompt
    setPrompt('')
    setMessages(prev => [...prev, {role: 'user', content: prompt, timestamp: Date.now(), isImage: false}])
    
    const {data} = await axios.post(
      `/api/message/${mode}`, 
      {chatId: selectedChat._id, prompt, isPublished}, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if(data.success){
      setMessages(prev => [...prev, data.reply])
      if(mode === 'image'){
        setUser(prev => ({...prev, credits: prev.credits - 2}))
      }else{
        setUser(prev => ({...prev, credits: prev.credits - 1}))
      }
    }else{
      toast.error(data.message)
      setPrompt(promptCopy)
    }
  } catch (error) {
    console.error("❌ ChatBox error:", error.response?.status, error.message)
    toast.error(error.response?.data?.message || error.message)
  } finally {
    setLoading(false)
  }
}

	const containerRef = useRef(null)

	useEffect(() => {
		if (selectedChat) {
			setMessages(selectedChat.messages)
		}
	}, [selectedChat])

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "smooth",
			})
		}
	}, [messages])

	return (
		<div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
			{/* Messages */}
			<div
				ref={containerRef}
				className='flex-1 mb-5 overflow-y-scroll'>
				{messages.length === 0 && (
					<div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
						<img
							className='w-full max-w-56 sm:max-w-68'
							src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
							alt='Logo'
						/>
						<p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400'>
							Спросите что угодно!
						</p>
					</div>
				)}
				{messages.map((message, index) => (
					<Message
						key={index}
						message={message}
					/>
				))}
				{/* Loading */}
				{loading && (
					<div className='loader flex items-center gap-1.5'>
						<div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
						<div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
						<div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
					</div>
				)}
			</div>
			{mode === "image" && (
				<label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
					<p className='text-xs font-semibold'>
						Публиковать сгенерированные изображения в публичную галерею
					</p>
					<input
						onChange={e => setIsPublished(e.target.checked)}
						type='checkbox'
						className='cursor-pointer appearance-none h-5 w-5 border-2 border-gray-300 rounded-md checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200'
						checked={isPublished}
					/>
				</label>
			)}
			{/* Prompt */}
			<form
				onSubmit={onSubmit}
				className='bg-primary/20 dark:bg-[#583C79/30] border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
				<select
					onChange={e => setMode(e.target.value)}
					value={mode}
					className='text-sm pl-3 pr-2 outline-none'>
					<option
						className='dark:bg-purple-900'
						value='text'>
						Текст
					</option>
					<option
						className='dark:bg-purple-900'
						value='image'>
						Фото
					</option>
				</select>
				<input
					type='text'
					placeholder='Введите ваш запрос...'
					className='flex-1 w-full outline-none'
					onChange={e => setPrompt(e.target.value)}
					value={prompt}
					required
				/>
				<button
					type='submit'
					className='outline-none border-none p-2 disabled:opacity-50 disabled:cursor-default'
					disabled={loading || !prompt.trim()}>
					<img
						className={`w-8 rounded-full transition-all duration-200 ${
							loading || !prompt.trim()
								? "cursor-default opacity-70"
								: "cursor-pointer hover:scale-110 hover:shadow-lg shadow-primary hover:shadow-primary/50 active:scale-95"
						}`}
						src={loading ? assets.stop_icon : assets.send_icon}
						alt={loading ? "stop" : "send"}
					/>
				</button>
			</form>
		</div>
	)
}

export default ChatBox
