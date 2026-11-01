import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import RenderBudget from '../three/RenderBudget'
import { useReducedMotion } from '../hooks/useReducedMotion'
import LabScene from './LabScene'
import LabDom from './LabDom'
import { catalog, categories } from './catalog'

class PreviewBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

function LabCard({ item, reduced, onToggle, format }) {
  const previewRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [version, setVersion] = useState(0)
  const [manual, setManual] = useState(false)
  const [finished, setFinished] = useState(false)
  const [expanded, setExpanded] = useState(Boolean(item.wide))
  const [failed, setFailed] = useState(false)
  const onDone = useCallback(() => setFinished(true), [])
  const onError = useCallback(() => setFailed(true), [])

  useEffect(() => setManual(false), [reduced])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
    }, { rootMargin: '80px' })
    observer.observe(previewRef.current)
    return () => observer.disconnect()
  }, [])

  const restart = () => {
    setFinished(false)
    setFailed(false)
    setManual(true)
    setVersion((v) => v + 1)
  }

  const dom = item.kind === 'dom' || item.kind === 'image'

  return (
    <article id={`lab-${item.id}`} className={`lab-card${expanded ? ' lab-card--expanded' : ''}`}>
      <div ref={previewRef} className={`lab-preview lab-preview--${format}${item.interactive ? ' lab-preview--interactive' : ''}`} role="group" aria-label={`Anteprima: ${item.title}`}>
        {visible && (
          <>
            <View key={`${version}-${format}-${expanded}`} className="lab-view" aria-hidden="true">
              <PreviewBoundary onError={onError}>
                <Suspense fallback={null}>
                  <LabScene item={item} reduced={reduced} manual={manual} finished={finished} onDone={onDone} />
                </Suspense>
              </PreviewBoundary>
            </View>
          </>
        )}
        {dom && (visible || item.interactive) && <div key={version} className="lab-dom"><LabDom item={item} reduced={reduced} onToggle={onToggle} /></div>}
        {failed && <p className="lab-preview-message" role="status">Anteprima non disponibile. Prova a riavviarla.</p>}
        {item.event && (finished || (item.id === 'nova' && !manual) || (reduced && !manual)) && !failed && (
          <button type="button" className="lab-play" onClick={restart} aria-label={`Riproduci ${item.title}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m6 3 11 7-11 7z" /></svg>
            Riproduci
          </button>
        )}
      </div>
      <div className="lab-card__body">
        <div className="lab-card__heading"><h2>{item.title}</h2><span>{item.category}</span></div>
        {item.status && <span className="lab-card__status" data-status={item.status}>{item.status === 'approved' ? 'Approvato' : 'Da valutare'}</span>}
        <p>{item.description}</p>
        <div className="lab-card__actions">
          <button type="button" onClick={restart}>{item.event ? 'Riproduci' : 'Riavvia'}</button>
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>{expanded ? 'Riduci' : 'Ingrandisci'}</button>
          <details><summary>Sorgente</summary><code>{item.source}</code></details>
        </div>
      </div>
    </article>
  )
}

export default function StyleLab() {
  const [reduced, toggleReduced] = useReducedMotion()
  const [category, setCategory] = useState(() => {
    const initial = new URLSearchParams(window.location.search).get('categoria')
    return categories.includes(initial) ? initial : 'Tutti'
  })
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('cerca') || '')
  const [format, setFormat] = useState('landscape')
  const search = query.trim().toLocaleLowerCase('it')
  const items = catalog.filter((item) => (category === 'Tutti' || item.category === category) && `${item.title} ${item.description} ${item.source}`.toLocaleLowerCase('it').includes(search))

  return (
    <div className="style-lab">
      <a className="lab-skip" href="#lab-gallery">Vai alle anteprime</a>
      <div className="lab-canvas" aria-hidden="true">
        <Canvas dpr={[1, 1.5]} gl={{ alpha: true }} fallback={<p className="lab-webgl-message">WebGL non disponibile: le anteprime 3D richiedono l’accelerazione grafica.</p>}>
          <RenderBudget />
          <View.Port />
        </Canvas>
      </div>
      <header className="lab-header">
        <a className="lab-back" href="./">← Torna a Novenix</a>
        <h1>Style Lab</h1>
        <p>Tutto l’universo di Novenix, un elemento alla volta. Lo stesso cielo, i componenti originali e spazio per sperimentare.</p>
      </header>
      <div className="lab-toolbar">
        <div className="lab-toolbar__inner">
          <label className="lab-search">Cerca un elemento<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pianeta, evento, componente…" /></label>
          <label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label>Formato<select value={format} onChange={(event) => setFormat(event.target.value)}><option value="landscape">Orizzontale</option><option value="portrait">Verticale</option></select></label>
          <button className="lab-motion" type="button" onClick={toggleReduced} aria-pressed={reduced}>{reduced ? 'Movimento ridotto' : 'Animazioni attive'}</button>
        </div>
      </div>
      <main className="lab-main" id="lab-gallery" tabIndex={-1}>
        <p className="lab-count" role="status">{items.length} di {catalog.length} elementi</p>
        <div className="lab-grid">
          {items.map((item) => <LabCard key={item.id} item={item} reduced={reduced} onToggle={toggleReduced} format={format} />)}
        </div>
        {items.length === 0 && <div className="lab-empty"><h2>Nessun elemento trovato</h2><button type="button" onClick={() => { setQuery(''); setCategory('Tutti') }}>Mostra tutti gli elementi</button></div>}
      </main>
      <footer className="lab-footer">Novenix · Style Lab</footer>
    </div>
  )
}
