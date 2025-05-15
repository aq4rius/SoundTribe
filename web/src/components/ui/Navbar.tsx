import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-30 flex items-center justify-between px-8 py-4 bg-black/60 backdrop-blur-md border-b border-white/10">
      <Link href="/">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          SoundTribe
        </span>
      </Link>
      <div className="flex gap-6 text-lg font-medium">
        <Link href="/artists" className="hover:text-fuchsia-400 transition-colors">
          Artists
        </Link>
        <Link href="/events" className="hover:text-cyan-400 transition-colors">
          Events
        </Link>
        <Link href="/chat" className="hover:text-emerald-400 transition-colors">
          Chat
        </Link>
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
      </div>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white font-bold shadow hover:from-fuchsia-500 hover:to-cyan-300 transition"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold shadow hover:from-emerald-400 hover:to-cyan-300 transition"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
