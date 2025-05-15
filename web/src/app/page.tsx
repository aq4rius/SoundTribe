'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: ref });
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.1]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0.2]);

  return (
    <main ref={ref} className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
      {/* Animated, static background with parallax effect */}
      <motion.div
        className="fixed inset-0 z-0 w-full h-full"
        style={{ scale: bgScale }}
        aria-hidden="true"
      >
        <Image
          src="/logo-placeholder.svg"
          alt="SoundTribe Portal Background"
          fill
          className="object-cover opacity-60 blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60" />
      </motion.div>

      {/* Content block with scroll-based transitions */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          style={{ opacity: contentOpacity }}
          className="flex flex-col items-center gap-8 text-center"
        >
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, type: 'spring' }}
            className="mb-8"
          >
            <Image
              src="/logo-placeholder.svg"
              alt="SoundTribe Logo"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-2xl border-4 border-white/20"
              priority
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg"
          >
            Welcome to SoundTribe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="max-w-2xl text-lg md:text-2xl text-white/80 font-medium"
          >
            Discover, connect, and create in the world’s most innovative music portal. Explore
            artists, join live events, and experience music like never before.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-wrap gap-4 justify-center mt-8"
          >
            <a
              href="#explore"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white font-bold shadow-lg hover:scale-105 hover:from-fuchsia-500 hover:to-cyan-300 transition-transform duration-200"
            >
              Explore Artists
            </a>
            <a
              href="#events"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold shadow-lg hover:scale-105 hover:from-emerald-400 hover:to-cyan-300 transition-transform duration-200"
            >
              Upcoming Events
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white/80" />
          <span className="w-1 h-6 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </main>
  );
}
