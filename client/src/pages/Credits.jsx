import React, { useEffect, useState } from "react"
import Loading from "./Loading"
import {useAppContext} from '../context/AppContext'
import toast from "react-hot-toast"

const Credits = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const {token, axios, user, loadingUser} = useAppContext() // ✅ Добавили loadingUser

  // ✅ ОТЛАДКА - смотрим что приходит из контекста
  console.log('🎯 Credits Context:', { 
    token: !!token, 
    userId: user?._id, 
    user, 
    loadingUser 
  })

  const fetchPlans = async () => {
    if (!token) {
      console.log('❌ Нет token')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const {data} = await axios.get('/api/credit/plan', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if(data.success){
        setPlans(data.plans || [])
      }else{
        toast.error(data.message || 'Ошибка при загрузке планов.')
        setPlans([])
      }
    } catch (error) {
      console.error('🚨 fetchPlans error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Ошибка сервера при загрузке планов')
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const purchasePlan = async (planId) => {
    console.log('🛒 purchasePlan called:', { planId, token: !!token, userId: user?._id })
    
    // ✅ Fallback - если нет user._id, пробуем взять из token (JWT)
    const userId = user?._id || JSON.parse(atob(token.split('.')[1])).id
    
    if (!token || !userId) {
      console.log('❌ purchasePlan: нет авторизации', { token: !!token, userId })
      toast.error('Необходима авторизация. Перезайдите в аккаунт.')
      return
    }

    try {
      toast.loading('Инициализация оплаты...', { id: 'purchase' })
      
      const {data} = await axios.post('/api/credit/purchase', { 
        planId,
        userId  // ✅ user._id или из JWT
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.dismiss('purchase')
      
      if(data.success){
        window.location.href = data.url
      }else {
        toast.error(data.message || 'Ошибка оплаты')
      }
    } catch (error) {
      toast.dismiss('purchase')
      console.error('🚨 purchasePlan error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Ошибка при оплате')
    }
  }

  // Пока грузится пользователь - показываем loading
  if (loadingUser) {
    console.log('⏳ Ждем загрузки пользователя...')
    return <Loading />
  }

  useEffect(() => {
    fetchPlans()
  }, [token])

  if (loading) return <Loading />

  return (
    <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h2 className='text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white'>
        Кредитные Планы
      </h2>
      
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-purple-400 text-lg mb-4">
            Планы не найдены
          </p>
          <button 
            onClick={fetchPlans}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            disabled={!token}
          >
            Обновить
          </button>
        </div>
      ) : (
        <div className='flex flex-wrap justify-center gap-8'>
          {plans.map(plan => (
            <div
              className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${
                plan._id === "pro"
                  ? "bg-purple-50 dark:bg-purple-900"
                  : "bg-white dark:bg-transparent"
              }`}
              key={plan._id}
            >
              <div className='flex-1'>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                  {plan.name}
                </h3>
                <p className='text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4'>
                  {plan.price} ₽
                  <span className='text-base font-normal text-gray-600 dark:text-purple-200'>
                    / {plan.credits} кредитов
                  </span>
                </p>
                <ul className='list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1'>
                  {plan.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => purchasePlan(plan._id)}
                className='mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!token || !user}
              >
                {token && user ? 'Оплатить' : 'Требуется вход'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Credits
