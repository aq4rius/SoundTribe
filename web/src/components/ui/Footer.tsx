export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 text-center text-white/60 text-sm bg-black/80 border-t border-white/10 mt-24">
      <span>© {new Date().getFullYear()} SoundTribe. All rights reserved.</span>
    </footer>
  );
}
