'use client'

import { motion } from 'framer-motion'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Segundos de espera antes de animar (para escalonar elementos) */
  delay?: number
  /** Desplazamiento vertical inicial en px */
  y?: number
}

/** Hace aparecer su contenido (fade + subida) cuando entra en pantalla. */
export default function Reveal({ children, className, delay = 0, y = 32 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
