import React from 'react'
import { motion } from 'framer-motion'

const SplashScreen: React.FC<{ onProceed: () => void }> = ({ onProceed }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-[#ffffff] z-50 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onProceed}
    >
      <motion.img
        src="/pravasipath_logo.svg"
        alt="PravasiPath Logo"
        className="h-40"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      />
      <motion.p
        className="absolute bottom-10 text-white text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        Click anywhere to start
      </motion.p>
    </motion.div>
  )
}

export default SplashScreen
