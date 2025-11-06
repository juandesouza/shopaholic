'use client'

import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} shopaholic. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

