import { useEffect, useRef, useState } from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import JourneyIntro from '../components/JourneyIntro'
import PortholeOverlay from '../components/PortholeOverlay'
import ReducedMotionToggle from '../components/ReducedMotionToggle'
import ServicesCarousel from '../components/ServicesCarousel'
import Skills, { SkillCard } from '../components/Skills'
import ProjectConstellation from '../components/projects/ProjectConstellation'

export default function LabDom({ item, reduced, onToggle }) {
  const frameRef = useRef(null)
  const contentRef = useRef(null)
  const [skillOpen, setSkillOpen] = useState(false)
  const fitted = ['hero', 'about', 'journey', 'services', 'skills', 'skill'].includes(item.demo)

  useEffect(() => {
    if (!fitted) return
    const frame = frameRef.current
    const content = contentRef.current
    const measure = () => {
      const scale = Math.min(frame.clientWidth / content.offsetWidth, frame.clientHeight / content.offsetHeight)
      content.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(content)
    measure()
    return () => observer.disconnect()
  }, [fitted])

  if (item.kind === 'image') {
    return <img className="lab-asset" src={`/media/${item.asset}`} alt={item.title} loading="lazy" decoding="async" />
  }
  if (item.demo === 'projects') return <ProjectConstellation reduced={reduced} />
  if (item.demo === 'porthole') return <div className="lab-local-overlay"><PortholeOverlay /></div>
  if (item.demo === 'motion-toggle') return <div className="lab-local-control"><ReducedMotionToggle reduced={reduced} onToggle={onToggle} /></div>

  return (
    <div ref={frameRef} className="lab-dom-frame">
      <div ref={contentRef} className={`lab-dom-stage${item.demo === 'skill' ? ' lab-dom-stage--skill' : ''}`}>
        {item.demo === 'hero' && <Hero reduced={reduced} />}
        {item.demo === 'about' && <About reduced={reduced} />}
        {item.demo === 'journey' && <JourneyIntro />}
        {item.demo === 'services' && <ServicesCarousel reduced={reduced} />}
        {item.demo === 'skills' && <Skills reduced={reduced} />}
        {item.demo === 'skill' && <SkillCard skill={item.skill} learning={item.learning} reduced={reduced} open={skillOpen} onOpenChange={setSkillOpen} />}
      </div>
    </div>
  )
}
