import { useEffect, useRef } from 'react'
import Hero from './Hero'

export default function CockpitIntro({ reduced }) {
  const sectionRef = useRef(null)
  const heroRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    let frame = 0
    let start = 0
    let distance = 1
    let titleOffset = 0
    let previousProgress = -1
    let previousReveal = -1
    const hero = heroRef.current
    const title = hero.querySelector('.hero-enter')
    const details = [...hero.querySelector('header').children].slice(1)

    const render = () => {
      frame = 0
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
      if (progress === previousProgress) return
      previousProgress = progress
      const approach = Math.min(1, progress / 0.85)
      const eased = approach * approach * (3 - 2 * approach)
      const image = imageRef.current
      image.style.transform = reduced ? 'none' : `scale(${1 + progress * 3})`
      image.style.opacity = String(reduced ? 1 - approach : Math.min(1, (1 - approach) / 0.2))
      image.style.visibility = approach === 1 ? 'hidden' : 'visible'
      title.style.transform = reduced || approach === 1
        ? 'none'
        : `translateY(${titleOffset * (1 - eased)}px) scale(${0.16 * Math.pow(6.25, eased)})`
      const revealProgress = Math.min(1, Math.max(0, (progress - 0.35) / 0.45))
      const reveal = revealProgress * revealProgress * (3 - 2 * revealProgress)
      if (reveal !== previousReveal) {
        details.forEach((element) => {
          element.style.opacity = String(reveal)
          if ((reveal === 0) !== (previousReveal === 0) || previousReveal === -1) {
            element.style.visibility = reveal === 0 ? 'hidden' : 'visible'
            element.inert = reveal === 0
          }
        })
        previousReveal = reveal
      }
    }

    const measure = () => {
      const section = sectionRef.current
      start = section.getBoundingClientRect().top + window.scrollY
      distance = Math.max(1, section.offsetHeight - section.firstElementChild.offsetHeight)
      titleOffset = Math.max(-64, Math.min(64,
        window.innerHeight * 0.43 - (title.offsetTop + title.offsetHeight / 2),
      ))
      previousProgress = -1
      render()
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(sectionRef.current)
    observer.observe(hero)
    window.addEventListener('scroll', onScroll, { passive: true })
    measure()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <section ref={sectionRef} className="cockpit-intro" aria-label="Benvenuto in Novenix">
      <div className="cockpit-intro__viewport">
        <div ref={heroRef} className="cockpit-intro__hero">
          <Hero reduced={reduced} />
        </div>
        <div className="cockpit-intro__cabin" aria-hidden="true">
          <picture>
            <source
              media="(max-aspect-ratio: 9/10)"
              srcSet="/media/cockpit-novenix-mobile-v1.png"
              width="948"
              height="1659"
            />
            <img
              ref={imageRef}
              className="cockpit-intro__image"
              src="/media/cockpit-novenix-v1.png"
              width="1672"
              height="941"
              alt=""
              fetchPriority="high"
              decoding="async"
              draggable="false"
            />
          </picture>
        </div>
      </div>
    </section>
  )
}
