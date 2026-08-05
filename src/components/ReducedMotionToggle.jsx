// posizione provvisoria (fixed, top-right): quando avremo il menu vero,
// spostiamo solo questo bottone dentro la navbar - la logica resta la stessa
export default function ReducedMotionToggle({ reduced, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={reduced}
      aria-label={reduced ? 'Riattiva le animazioni' : 'Riduci le animazioni'}
      title={reduced ? 'Animazioni ridotte' : 'Animazioni attive'}
      className="fixed top-(--porthole-safe-margin) right-(--porthole-safe-margin) z-20 flex h-10 w-10 items-center justify-center rounded-full border border-space-white/20 bg-space-blue/60 text-space-white backdrop-blur-sm transition hover:border-space-white/50"
    >
      {reduced ? (
        // pallino fermo = animazioni ridotte
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="8" r="6" />
        </svg>
      ) : (
        // pallino in orbita = animazioni attive
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" />
          <ellipse cx="9" cy="9" rx="7" ry="3" />
        </svg>
      )}
    </button>
  )
}
