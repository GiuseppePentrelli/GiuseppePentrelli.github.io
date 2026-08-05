import Universe from './three/Universe'
import ReducedMotionToggle from './components/ReducedMotionToggle'
import PortholeOverlay from './components/PortholeOverlay'
import { useReducedMotion } from './hooks/useReducedMotion'

function App() {
  const [reducedMotion, toggleReducedMotion] = useReducedMotion()

  return (
    <div className="relative min-h-screen">
      <Universe reducedMotion={reducedMotion} />
      <ReducedMotionToggle reduced={reducedMotion} onToggle={toggleReducedMotion} />
      {/* z-10 = sopra al canvas 3D. h1 è solo un placeholder, poi arriva l'hero vero */}
      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <h1 className="font-display text-space-white text-4xl tracking-widest uppercase">
          Novenix
        </h1>
      </main>
      <PortholeOverlay />
    </div>
  )
}

export default App
