// la prima sezione, come nell'originale: titolo al neon, l'avatar che dà il benvenuto e le
// frecce che invitano a scendere. In più rispetto all'originale una riga con nome e ruolo,
// perché chi arriva capisca subito di chi è il sito. `--i` decide l'ordine dell'entrata
export default function Hero({ reduced }) {
  const motion = reduced ? ' no-motion' : ''

  return (
    <header id="home" className={`hero relative flex min-h-svh flex-col items-center justify-center px-4 py-24${motion}`}>
      <div className="hero-enter" style={{ '--i': 0 }}>
        {/* due righe come nell'originale: su una riga sola il titolo occupava tutta la larghezza */}
        <h1 className={`font-display hero-title${motion}`}>
          <span className="block">Benvenuto in</span> <span className="block">Novenix</span>
        </h1>
      </div>

      {/* sul telefono nome e ruolo vanno su due righe intere, invece di spezzarsi a metà del ruolo */}
      <p className="hero-enter hero-subtitle font-display text-center text-sm tracking-[0.2em] text-space-white uppercase sm:text-base sm:tracking-[0.3em]" style={{ '--i': 1 }}>
        <span className="block sm:inline">Giuseppe Pentrelli</span>
        <span className="hidden text-space-cyan sm:inline" aria-hidden="true"> · </span>
        <span className="block sm:inline">Full Stack Web Developer</span>
      </p>

      <div className="hero-enter mt-8" style={{ '--i': 2 }}>
        <img
          src="/media/welcomeMe.avif"
          srcSet="/media/welcomeMe-mobile.avif 300w, /media/welcomeMe.avif 500w"
          sizes="(max-width: 640px) 240px, 400px"
          width="500"
          height="500"
          alt="Giuseppe in tuta da astronauta, con il suo razzo alle spalle, che dà il benvenuto"
          fetchPriority="high"
          decoding="async"
          className="hero-avatar h-auto w-60 sm:w-[min(400px,42svh)]"
        />
      </div>

      <a href="#viaggio" className="scroll-down hero-enter" style={{ '--i': 3 }} aria-label="Scendi e inizia il viaggio">
        {[0, 1].map((column) => (
          <span key={column} className="scroll-down__column" aria-hidden="true">
            <span className="scroll-down__tip">&gt;</span>
            <span className="scroll-down__tip">&gt;</span>
            <span className="scroll-down__tip">&gt;</span>
          </span>
        ))}
      </a>
    </header>
  )
}
