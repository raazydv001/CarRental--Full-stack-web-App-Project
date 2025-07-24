import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const Cars = () => {
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const { cars, axios } = useAppContext()
  const isSearchData = pickupLocation && pickupDate && returnDate

  const [input, setInput] = useState('')
  const [filteredCars, setFilteredCars] = useState([])

  const applyFilter = async () => {
    if (input === '') {
      setFilteredCars(cars)
      return
    }

    const filtered = cars.filter((car) =>
      [car.brand, car.model, car.category, car.transmission]
        .some(field => field.toLowerCase().includes(input.toLowerCase()))
    )
    setFilteredCars(filtered)
  }

  const searchCarAvailability = async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate,
        returnDate,
      })

      if (data.success) {
        setFilteredCars(data.availableCars)
        if (data.availableCars.length === 0) toast('No cars available')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Failed to fetch available cars')
    }
  }

  useEffect(() => {
    if (isSearchData) searchCarAvailability()
  }, [isSearchData])

  useEffect(() => {
    if (!isSearchData && cars.length > 0) applyFilter()
  }, [input, cars])

  return (
    <div>
      {/* Top Section */}
      <motion.div
        className='flex flex-col items-center py-20 bg-light max-md:px-4'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Title
          title='Available Cars'
          subTitle='Browse our selection of premium vehicles available for your next adventure'
        />

        {/* Search Bar */}
        <motion.div
          className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img src={assets.search_icon} alt='' className='w-4.5 h-4.5 mr-2' />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type='text'
            placeholder='Search by make, model, or features'
            className='w-full h-full outline-none text-gray-500'
          />
          <img src={assets.filter_icon} alt='' className='w-4.5 h-4.5 ml-2' />
        </motion.div>
      </motion.div>

      {/* Cars Section */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <motion.p
          className='text-gray-500 xl:px-20 max-w-7xl mx-auto'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Showing {filteredCars.length} Cars
        </motion.p>

        {/* Car Grid */}
        <motion.div
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {filteredCars.map((car, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Cars

