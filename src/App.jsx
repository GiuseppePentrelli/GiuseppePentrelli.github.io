import { lazy, Suspense } from 'react'
import ReducedMotionToggle from './components/ReducedMotionToggle'
import PortholeOverlay from './components/PortholeOverlay'
import JourneyIntro from './components/JourneyIntro'
import About from './components/About'
import CockpitIntro from './components/CockpitIntro'
import ServicesCarousel from './components/ServicesCarousel'
import Skills from './components/Skills'
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
      <main className="portfolio-content relative">
        <CockpitIntro reduced={reducedMotion} />
        <JourneyIntro />
        <About reduced={reducedMotion} />
        <ServicesCarousel reduced={reducedMotion} />
        <Skills reduced={reducedMotion} />
      </main>
      <PortholeOverlay />
    </div>
  )
}

export default App
