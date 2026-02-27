'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const FLOATING_TAGS = [
  { label: 'Electronic', x: '8%',  y: '15%', duration: 18, delay: 0    },
  { label: 'Jazz',       x: '75%', y: '12%', duration: 22, delay: 2    },
  { label: 'Hip-Hop',   x: '20%', y: '72%', duration: 20, delay: 1    },
  { label: 'Techno',    x: '60%', y: '68%', duration: 25, delay: 3    },
  { label: 'R&B',       x: '85%', y: '40%', duration: 17, delay: 0.5  },
  { label: 'Punk',      x: '5%',  y: '48%', duration: 23, delay: 4    },
  { label: 'Classical', x: '45%', y: '82%', duration: 19, delay: 1.5  },
  { label: 'Reggae',    x: '30%', y: '20%', duration: 21, delay: 2.5  },
  { label: 'Metal',     x: '70%', y: '85%', duration: 16, delay: 0.8  },
  { label: 'Soul',      x: '50%', y: '10%', duration: 24, delay: 3.5  },
  { label: 'Producer',  x: '15%', y: '35%', duration: 20, delay: 1.2  },
  { label: 'DJ',        x: '88%', y: '62%', duration: 18, delay: 2.8  },
  { label: 'Vocalist',  x: '38%', y: '58%', duration: 22, delay: 0.3  },
  { label: 'Guitarist', x: '62%', y: '30%', duration: 19, delay: 4.2  },
  { label: 'Drummer',   x: '25%', y: '88%', duration: 23, delay: 1.8  },
];

export default function HeroSection() {
  const { status } = useSession();

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4">
      {/* CSS gradient background */}
      <div
        className="fixed inset-0 z-0 w-full h-full"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, #7c3aed33 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0e749022 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #065f4622 0%, transparent 50%), #000000',
        }}
      />

      {/* Floating genre/role tags */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {FLOATING_TAGS.map((tag) => (
          <motion.span
            key={tag.label}
            className="absolute px-3 py-1 rounded-full border border-white/10 text-white/20 text-xs font-medium bg-white/[0.03] backdrop-blur-[1px] select-none"
            style={{ left: tag.x, top: tag.y }}
            animate={{
              y: [0, -12, 0, 8, 0],
              opacity: [0.15, 0.35, 0.15, 0.3, 0.15],
            }}
            transition={{
              duration: tag.duration,
              delay: tag.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {tag.label}
          </motion.span>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg"
        >
          Find Your{' '}
          <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Musical Tribe
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="max-w-2xl text-lg md:text-2xl text-white/80 font-medium"
        >
          Connect with artists, musicians and event organizers near you.{' '}
          <br className="hidden sm:block" />
          Collaborate, perform, and grow together.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-4"
        >
          {status === 'authenticated' ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/artists">Browse Artists</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/events">Find Events</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">Join SoundTribe Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/artists">Browse Artists</Link>
              </Button>
            </div>
          )}
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
