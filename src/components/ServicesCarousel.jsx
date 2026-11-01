import { useId, useState } from 'react'
import { services } from '../data/portfolio'

export default function ServicesCarousel({ reduced }) {
  const [active, setActive] = useState(0)
  const id = useId()
  const change = (step) => setActive((current) => (current + step + services.length) % services.length)

  return (
    <section id="servizi" className={`services-carousel font-display${reduced ? ' no-motion' : ''}`} aria-labelledby={`${id}-title`} aria-roledescription="carosello">
      <h2 id={`${id}-title`} className="sr-only">I miei servizi</h2>
      <div className="services-carousel__slides">
        {services.map((service, index) => (
          <div key={service.title} id={`${id}-slide-${index}`} className="services-carousel__slide" data-active={index === active} aria-hidden={index !== active} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} di ${services.length}`}>
            <p className="services-carousel__tag">{service.tag}</p>
            <h3 className="services-carousel__title">{service.title}</h3>
            <p className="services-carousel__text">{service.text}</p>
          </div>
        ))}
      </div>
      <div className="services-carousel__controls">
        <button type="button" className="services-carousel__direction" onClick={() => change(-1)} aria-label="Servizio precedente">Prec.</button>
        <div className="services-carousel__dots" role="group" aria-label="Scegli un servizio">
          {services.map((service, index) => (
            <button key={service.title} type="button" aria-label={`Mostra ${service.title}`} aria-controls={`${id}-slide-${index}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)}><span aria-hidden="true" /></button>
          ))}
        </div>
        <div className="services-carousel__next">
          <img src="/media/alienSleeping.avif" width="250" height="250" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <button type="button" className="services-carousel__direction" onClick={() => change(1)} aria-label="Servizio successivo">Succ.</button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">Servizio {active + 1} di {services.length}: {services[active].title}</p>
    </section>
  )
}
