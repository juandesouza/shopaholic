'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Star } from 'lucide-react'
import { Button } from './ui/button'

interface Product {
  id: number
  name: string
  price: number
  description: string
  rating: number
  image?: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 199.99,
    description: 'High-quality sound with noise cancellation',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 299.99,
    description: 'Track your fitness and stay connected',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Laptop Backpack',
    price: 79.99,
    description: 'Durable and stylish laptop protection',
    rating: 4.6,
  },
  {
    id: 4,
    name: 'USB-C Charging Cable',
    price: 24.99,
    description: 'Fast charging for all your devices',
    rating: 4.4,
  },
  {
    id: 5,
    name: 'Wireless Mouse',
    price: 49.99,
    description: 'Ergonomic design with precision tracking',
    rating: 4.7,
  },
  {
    id: 6,
    name: 'Desk Organizer Set',
    price: 34.99,
    description: 'Keep your workspace tidy and organized',
    rating: 4.3,
  },
]

export function ProductList() {
  return (
    <div className="mt-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            style={{ opacity: 1 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-accent/5"
          >
            <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-muted/30">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>

            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {product.rating}
                </span>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {product.name}
            </h3>

            <p className="mb-4 text-sm text-muted-foreground">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-accent">
                ${product.price.toFixed(2)}
              </span>
              <Button size="sm" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

