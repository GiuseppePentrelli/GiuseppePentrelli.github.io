import { lazy, Suspense } from 'react'
import ReducedMotionToggle from './components/ReducedMotionToggle'
import PortholeOverlay from './components/PortholeOverlay'
import { useReducedMotion } from './hooks/useReducedMotion'

// la scena 3D (Three.js è quasi tutto il peso del sito) arriva in un file a parte: il titolo
// compare subito sul fondo blu del CSS, il cielo si accende appena il file è scaricato
const Universe = lazy(() => import('./three/Universe'))

function App() {
  const [reducedMotion, toggleReducedMotion] = useReducedMotion()

  return (
    <div className="relative min-h-screen">
      <Suspense fallback={null}>
        <Universe reducedMotion={reducedMotion} />
      </Suspense>
      <ReducedMotionToggle reduced={reducedMotion} onToggle={toggleReducedMotion} />
      {/* z-10 = sopra al canvas 3D. h1 è solo un placeholder, poi arriva l'hero vero */}
      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <h1 className={`font-display hero-title${reducedMotion ? ' no-motion' : ''}`}>
          Novenix
        </h1>
      </main>
      <PortholeOverlay />
    </div>
  )
}

export default App
