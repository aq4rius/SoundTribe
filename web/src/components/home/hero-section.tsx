'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* CSS gradient background */}
      <div
        className="fixed inset-0 z-0 w-full h-full"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, #7c3aed33 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0e749022 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #065f4622 0%, transparent 50%), #000000',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg"
        >
          Welcome to SoundTribe
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="max-w-2xl text-lg md:text-2xl text-white/80 font-medium"
        >
          Discover, connect, and create in the world&apos;s most innovative music portal. Explore
          artists, join live events, and experience music like never before.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-wrap gap-4 justify-center mt-4"
        >
          <Link
            href="/artists"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white font-bold shadow-lg hover:scale-105 hover:from-fuchsia-500 hover:to-cyan-300 transition-transform duration-200"
          >
            Explore Artists
          </Link>
          <Link
            href="/events"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold shadow-lg hover:scale-105 hover:from-emerald-400 hover:to-cyan-300 transition-transform duration-200"
          >
            Upcoming Events
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white/80" />
          <span className="w-1 h-6 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </section>
  );
}
