import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assets, menuLinks } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import {toast} from 'react-hot-toast'
import {motion} from 'motion/react'

const Navbar = () => {

const {setShowLogin, user , logout , isOwner , axios , setIsOwner} = useAppContext();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const changeRole = async()=>{
    try {
      const {data} = await axios.post('/api/owner/change-role')
      if(data.success){
        setIsOwner(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
      
    }
  }

  return (
    <motion.div
    initial ={{y: -20 , opacity:0}}
    animate ={{y:0,opacity:1}}
    transition={{duration: 0.5}}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${
        location.pathname === '/' && 'bg-white'
      }`}
    >
      {/* Logo */}
      <Link to="/">
        <motion.img whileHover={{scale: 1.10}} src={assets.logo} alt="logo" className="h-8" />
      </Link>

      {/* Menu links */}
      <div
        className={`max-sm:fixed max-sm:top-16 max-sm:left-0 max-sm:w-full max-sm:h-screen
        max-sm:bg-white max-sm:border-t border-borderColor
        flex flex-col sm:flex-row items-center sm:items-center
        gap-4 sm:gap-8 max-sm:p-4 z-50 transition-transform duration-300
        ${open ? 'max-sm:translate-x-0' : 'max-sm:translate-x-full'}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path} onClick={() => setOpen(false)}>
            {link.name}
          </Link>
        ))}

        {/* Search bar (only visible on large screens) */}
        <div className="hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56">
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt="Search" />
        </div>

        {/* Buttons */}
        <div className="flex max-sm:flex-col items-center gap-6">
          <button
            onClick={() => { isOwner ?
              navigate('/owner'): changeRole()
             
            }}
            className="cursor-pointer"
          >
           {isOwner?' Dashboard' : 'List cars'}
          </button>


          <button
            onClick={() => {
             user ? logout() : setShowLogin(true);
              
            }}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primar transition-all text-white rounded-lg"
          >
            {user ? 'Logout':'Login'}
          </button>
        </div>
      </div>

      {/* Hamburger menu toggle (mobile only) */}
      <button
        className="sm:hidden cursor-pointer"
        aria-label="menu"
        onClick={() => setOpen(!open)}
      >
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </motion.div>
  );
};

export default Navbar;
