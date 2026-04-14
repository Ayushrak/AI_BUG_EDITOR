import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/30 bg-dark-950/80 backdrop-blur-lg">
      <div className="px-6 sm:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold gradient-text">CodeGuardian</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Home
          </Link>
          <Link
            href="/scan"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Scanner
          </Link>
          <a
            href="#features"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Pricing
          </a>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white transition-colors text-sm font-medium hidden sm:block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}
