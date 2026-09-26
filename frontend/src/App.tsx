import { useState } from 'react'
import { 
  Sparkles, 
  Zap, 
  Layers, 
  Palette, 
  Code2, 
  Check, 
  Copy, 
  ExternalLink, 
  Rocket, 
  Flame,
  Globe,
  ArrowRight
} from 'lucide-react'

export default function App() {
  const [count, setCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Vite 6 Fast",
      desc: "Instant Hot Module Replacement (HMR) and ultra-fast build speeds powered by esbuild and Rollup."
    },
    {
      icon: <Flame className="w-6 h-6 text-cyan-400" />,
      title: "React 19 Ready",
      desc: "Equipped with the latest React 19 features, strict typing, and optimized concurrent rendering."
    },
    {
      icon: <Palette className="w-6 h-6 text-teal-400" />,
      title: "Tailwind CSS v4",
      desc: "Zero-configuration CSS-first configuration, lightning-fast Rust-based engine, and modern utilities."
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      title: "TypeScript 5+",
      desc: "Full type safety, modern syntax, and seamless developer experience out of the box."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/20 to-purple-600/20 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[350px] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Ezgo Vite
            </span>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v4.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              Tailwind Docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              Vite Docs <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 mb-8 shadow-inner">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Vite + React 19 + Tailwind CSS v4 is ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Build modern web apps with speed & style.
        </h1>

        <p className="mt-5 text-slate-400 text-lg max-w-2xl leading-relaxed">
          The ultimate modern stack configured with instant hot-reloading, zero-friction Tailwind CSS v4 styling, and full TypeScript support.
        </p>

        {/* Action / Interactive Counter Card */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition active:scale-95"
          >
            <span>Interactive Counter</span>
            <span className="px-2 py-0.5 rounded-md bg-black/30 font-mono text-xs font-semibold backdrop-blur-sm group-hover:bg-black/40">
              {count}
            </span>
          </button>

          <button
            onClick={() => copyCommand('npm run dev')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-sm transition shadow-sm active:scale-95"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>npm run dev</span>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500 hover:text-slate-300" />
            )}
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20 w-full text-left">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition duration-200 flex flex-col justify-between group shadow-sm hover:shadow-cyan-500/5"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-base text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div className="mt-16 w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-left shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">src/App.tsx</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              Ready to code
            </span>
          </div>
          <pre className="font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
            <code>
              <span className="text-purple-400">export default function</span>{' '}
              <span className="text-cyan-400">App</span>() {'{\n'}
              {'  '}<span className="text-purple-400">return</span> ({'\n'}
              {'    '}&lt;<span className="text-cyan-300">div</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">"min-h-screen bg-slate-950 text-white flex items-center justify-center"</span>&gt;{'\n'}
              {'      '}&lt;<span className="text-cyan-300">h1</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">"text-4xl font-bold"</span>&gt;Hello Vite + Tailwind!&lt;/<span className="text-cyan-300">h1</span>&gt;{'\n'}
              {'    '}&lt;/<span className="text-cyan-300">div</span>&gt;{'\n'}
              {'  '}){'\n'}
              {'}'}
            </code>
          </pre>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Built with Vite, React & Tailwind CSS</span>
          </div>
          <p>© {new Date().getFullYear()} Ezgo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
