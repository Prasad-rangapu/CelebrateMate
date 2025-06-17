export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-lg text-indigo-700 text-center py-6 mt-12 rounded-t-3xl shadow-lg border border-white/30">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-semibold tracking-wide bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          © {new Date().getFullYear()} CelebrateMate. All rights reserved.
        </span>
        <span className="opacity-80">
          Made with <span className="text-pink-400">♥</span> for celebrations!
        </span>
      </div>
    </footer>
  );
}