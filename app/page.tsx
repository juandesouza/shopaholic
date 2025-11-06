'use client'

import { motion } from 'framer-motion'
import { ShoppingList } from './components/ShoppingList'
import { ShoppingCart } from './components/ShoppingCart'
import SupabaseStatus from './components/SupabaseStatus'
import DeleteAccountButton from './components/DeleteAccountButton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
        style={{ opacity: 1 }}
      >
        {/* Header Section */}
        <motion.section variants={itemVariants} className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Welcome to</span>
            <span className="block bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              shopaholic
            </span>
          </h1>
        </motion.section>

        {/* Supabase Status */}
        <motion.section variants={itemVariants}>
          <SupabaseStatus />
        </motion.section>

        {/* Shopping List Section */}
        <motion.section variants={itemVariants}>
          <ShoppingList />
        </motion.section>

        {/* Shopping Cart Section */}
        <motion.section variants={itemVariants}>
          <ShoppingCart />
        </motion.section>

        {/* Delete Account Button */}
        <motion.section variants={itemVariants}>
          <DeleteAccountButton />
        </motion.section>
      </motion.div>
    </div>
  )
}
