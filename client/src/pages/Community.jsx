import React, { useEffect, useState } from "react"
import Loading from "./Loading"
import { useAppContext } from "../context/AppContext"
import toast from "react-hot-toast"

const Community = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const { axios } = useAppContext()

const fetchImage = async () => {
  try {
    const { data } = await axios.get('/api/user/published-images');
    setImages(data.image || []);
  } catch (error) {
    setImages([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchImage()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='p-6 pt-12 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-scroll'>
      <h2 className='text-xl font-semibold mb-6 text-gray-800 dark:text-purple-100'>
        Галерея изображений ({images.length})
      </h2>
      
      {images.length > 0 ? (
        <div className='flex flex-wrap max-sm:justify-center gap-5'>
          {images.map((item, index) => (
            <a
              href={item.imageUrl}
              key={`${item.imageUrl}-${index}`}
              target='_blank'
              rel='noopener noreferrer'
              className='relative group block rounded-lg overflow-hidden border border-gray-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow duration-300 w-64'
            >
              <img
                src={item.imageUrl}
                alt={`Изображение от ${item.userName || 'пользователя'}`}
                className='w-full h-48 md:h-52 2xl:h-64 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out'
                loading='lazy'
              />
              <p className='absolute bottom-0 right-0 left-0 bg-black/70 backdrop-blur text-white px-3 py-2 text-sm truncate'>
                Автор: {item.userName || 'Аноним'}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-600 dark:text-purple-200 text-lg mb-4'>
            Нет опубликованных изображений
          </p>
          <p className='text-sm text-gray-500 dark:text-purple-400'>
            Опубликуйте изображения в чате для появления в галерее
          </p>
        </div>
      )}
    </div>
  )
}

export default Community
