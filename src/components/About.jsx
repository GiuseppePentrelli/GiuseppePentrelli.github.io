import { useEffect, useMemo, useState } from 'react'
import { useInView } from '../hooks/useInView'

// il curriculum dell'originale (/Pentrelli_Giuseppe_Curriculum_Vitae.pdf): il bottone compare
// solo quando qui c'è il percorso del file, che va prima copiato in public/
const CV_URL = null

// il testo della console dell'originale, a pezzi: `strong` è il grassetto, `br` va a capo
const LOG = [
  { text: '> Inizializzazione sistema... OK', br: true },
  { text: '> Accesso utente: ' },
  { text: 'Giuseppe', strong: true, br: true },
  { text: 'Ciao! Sono ' },
  { text: 'Giuseppe', strong: true },
  { text: ', un ' },
  { text: 'Full Stack Web Developer', strong: true },
  {
    text: " con la missione di dare vita a idee digitali. Gestisco l'intero ciclo di sviluppo, trasformando requisiti complessi in esperienze utente impeccabili e sistemi Back-End robusti. La mia filosofia è unire un ",
  },
  { text: "design orientato all'utente", strong: true },
  { text: ' con una ' },
  { text: 'logica di sistema solida e scalabile', strong: true },
  { text: '.' },
]
const LOG_LENGTH = LOG.reduce((sum, part) => sum + part.text.length, 0)
const TYPE_MS = 22 // un carattere ogni 22 ms, come la macchina da scrivere dell'originale

const MISSION = [
  { icon: '🚀', label: 'Ruolo', value: 'Full Stack Web Developer' },
  { icon: '🛰', label: 'Obiettivo', value: 'Creare interfacce e sistemi web innovativi' },
  { icon: '🌍', label: 'Posizione', value: 'Italia, Modugno (Remoto/Ibrido)' },
]

// gli oggetti che girano attorno alla foto: dimensione e raggio in frazioni della cornice
// (così l'orbita si restringe insieme a lei sul telefono), durata, verso, e `start` in
// frazione di giro, per non partire tutti dallo stesso punto
const ORBITERS = [
  { src: 'planet1', size: 0.18, radius: 0.5, duration: 18, start: 0 },
  { src: 'planet2', size: 0.1, radius: 0.6, duration: 22, start: 0.35, reverse: true },
  { src: 'satellite', size: 0.14, radius: 0.56, duration: 20, start: 0.6, reverse: true },
  { src: 'satellite2', size: 0.08, radius: 0.68, duration: 24, start: 0.15 },
  { src: 'star', size: 0.12, radius: 0.64, duration: 14, start: 0.8 },
  { src: 'star2', size: 0.07, radius: 0.76, duration: 16, start: 0.5, reverse: true },
]

function renderLog(count) {
  let left = count
  return LOG.map((part, i) => {
    const shown = part.text.slice(0, Math.max(0, left))
    left -= part.text.length
    if (!shown) return null
    const text = part.strong ? <strong className="text-console-neon-blue">{shown}</strong> : shown
    return (
      <span key={i}>
        {text}
        {part.br && shown.length === part.text.length && <br />}
      </span>
    )
  })
}

// la console scrive il log un carattere alla volta quando la sezione entra nello schermo.
// Con il movimento ridotto il testo c'è subito tutto
function useTypewriter(start, reduced) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start || reduced || count >= LOG_LENGTH) return
    const id = setTimeout(() => setCount((c) => c + 1), TYPE_MS)
    return () => clearTimeout(id)
  }, [start, reduced, count])

  return reduced ? LOG_LENGTH : count
}

export default function About({ reduced }) {
  const [ref, visible] = useInView({ threshold: 0.35 })
  const count = useTypewriter(visible, reduced)
  const fullLog = useMemo(() => renderLog(LOG_LENGTH), [])

  return (
    <section
      id="about"
      ref={ref}
      aria-labelledby="about-title"
      className={`about relative overflow-x-clip px-4 py-24${reduced ? ' no-motion' : ''}`}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-20 lg:grid-cols-2 lg:gap-12">
        <div className="flex justify-center">
          <div className="astro-frame">
            <img
              src="/media/fotoProfilo.avif"
              width="500"
              height="500"
              alt="Giuseppe in tuta da astronauta che saluta, seduto su una luna"
              loading="lazy"
              decoding="async"
              className="relative z-10 block size-full rounded-full"
            />
            {ORBITERS.map((o) => (
              <img
                key={o.src}
                src={`/media/${o.src}.avif`}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="orbiter"
                style={{
                  '--size': o.size,
                  '--radius': o.radius,
                  animationDuration: `${o.duration}s`,
                  animationDirection: o.reverse ? 'reverse' : 'normal',
                  animationDelay: `${-o.start * o.duration}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="console font-mono">
          <div className="console-screen">
            <h2 id="about-title" className="console-title">
              Log di sistema: Giuseppe v. 1.0
            </h2>
            {/* il testo intero per i lettori di schermo; quello che si scrive è solo da vedere */}
            <p className="sr-only">{fullLog}</p>
            {/* due copie sovrapposte: quella invisibile tiene già l'altezza del testo finito,
                così la scheda sotto non scende mentre il log si scrive */}
            <div className="console-text grid" aria-hidden="true">
              <p className="invisible col-start-1 row-start-1">{fullLog}</p>
              <p className="col-start-1 row-start-1">
                {renderLog(count)}
                <span className="console-cursor">|</span>
              </p>
            </div>
          </div>

          <div className="mission-card mt-6">
            <h3 className="mission-title">
              <span aria-hidden="true">📋 </span>Scheda missione · Log dati
            </h3>
            <ul className="mission-list">
              {MISSION.map((item) => (
                <li key={item.label}>
                  <span aria-hidden="true">{item.icon} </span>
                  <strong>{item.label}:</strong> {item.value}
                </li>
              ))}
            </ul>
          </div>

          {CV_URL && (
            <div className="mt-8 flex justify-center">
              <a href={CV_URL} download className="command-button" aria-label="Scarica il curriculum vitae in formato PDF">
                [Trasmetti curriculum vitae]
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
