import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { projects, projectTopics } from '../../data/projects'
import { matchesFilter } from './graph'
import ProjectGraph from './ProjectGraph'
import ProjectDetails from './ProjectDetails'
import ProjectPreview from './ProjectPreview'
import './constellation.css'

export default function ProjectConstellation({ reduced = false, page = false }) {
  const id = useId()
  const [preview, setPreview] = useState(null)
  const sectionRef = useRef(null)
  const timer = useRef(null)
  const dismissed = useRef(null)
  const selected = preview?.id ?? null

  useEffect(() => () => clearTimeout(timer.current), [])
  const keepOpen = () => clearTimeout(timer.current)
  const closePreview = (restoreFocus = false) => {
    keepOpen()
    dismissed.current = preview?.id
    setPreview(null)
    setHovered(null)
    if (restoreFocus) preview?.trigger.focus({ preventScroll: true })
  }
  const leavePreview = () => {
    keepOpen()
    if (!preview?.pinned) timer.current = setTimeout(() => setPreview(null), 300)
  }
  const previewProject = (projectId, trigger, source) => {
    setHovered(projectId)
    if (!projectId || !projects.some((project) => project.id === projectId)) {
      leavePreview()
      return
    }
    if (source === 'pointer') dismissed.current = null
    if (dismissed.current === projectId || preview?.pinned) return
    keepOpen()
    const open = () => setPreview({ id: projectId, trigger, pinned: false })
    if (source === 'focus') open()
    else timer.current = setTimeout(open, 140)
  }
  const [hovered, setHovered] = useState(null)
  const [filter, setFilter] = useState('all')
  const [zoom, setZoom] = useState(1)
  const [resetVersion, setResetVersion] = useState(0)
  const technologies = useMemo(() => [...new Set(projects.flatMap((project) => project.technologies))].sort(), [])
  const project = projects.find((project) => project.id === selected)
  const count = projects.filter((project) => matchesFilter(project, filter)).length
  const selectProject = (projectId) => {
    keepOpen()
    if (preview?.id === projectId && preview.pinned) {
      closePreview()
      return
    }
    const trigger = sectionRef.current.querySelector(`[data-project-id="${projectId}"]`)
    if (!trigger) return
    setPreview({ id: projectId, trigger, pinned: true })
    setHovered(null)
    if (!matchesFilter(projects.find((project) => project.id === projectId), filter)) setFilter('all')
  }
  const changeFilter = (value) => {
    setFilter(value)
    setHovered(null)
    if (project && !matchesFilter(project, value)) closePreview()
  }
  const reset = () => {
    closePreview()
    setHovered(null)
    setFilter('all')
    setZoom(1)
    setResetVersion((version) => version + 1)
  }

  return (
    <section ref={sectionRef} id={page ? 'work' : undefined} className={`project-constellation font-display${page ? ' project-constellation--page' : ''}${reduced ? ' no-motion' : ''}`} aria-labelledby={`${id}-title`}>
      <header className="constellation__header"><div><h2 id={`${id}-title`} className={page ? 'main-title' : undefined}>{page ? 'I miei progetti' : 'Il mio universo di progetti'}</h2><p>Segui una stella. Scopri le connessioni.</p></div><span className="constellation__count">{count} {count === 1 ? 'progetto' : 'progetti'}</span></header>
      {!page && <div className="constellation__filters" role="group" aria-label="Filtra i progetti per tema o tecnologia">
        <button type="button" aria-pressed={filter === 'all'} onClick={() => changeFilter('all')}>Tutta la galassia</button>
        {Object.entries(projectTopics).map(([key, topic]) => <button key={key} type="button" aria-pressed={filter === `topic:${key}`} onClick={() => changeFilter(filter === `topic:${key}` ? 'all' : `topic:${key}`)}><span style={{ backgroundColor: topic.color }} aria-hidden="true" />{topic.label}</button>)}
        {technologies.map((technology) => <button key={technology} type="button" aria-pressed={filter === `tech:${technology}`} onClick={() => changeFilter(filter === `tech:${technology}` ? 'all' : `tech:${technology}`)}>{technology}</button>)}
      </div>}
      <div className="constellation__layout">
        <div className="constellation__map">
          <ProjectGraph projects={projects} selected={selected} hovered={hovered} filter={filter} zoom={zoom} resetVersion={resetVersion} onSelect={selectProject} onPreview={previewProject} previewId={`${id}-preview`} onFilter={changeFilter} onReset={reset} />
          {!page && <div className="constellation__map-footer"><span>Seleziona una stella per esplorare</span><div className="constellation__view-controls" role="group" aria-label="Inquadratura della costellazione"><button type="button" aria-label="Riduci lo zoom" disabled={zoom <= 0.8} onClick={() => setZoom((value) => Math.max(0.8, +(value - 0.1).toFixed(1)))}>−</button><button type="button" aria-label="Aumenta lo zoom" disabled={zoom >= 1.2} onClick={() => setZoom((value) => Math.min(1.2, +(value + 0.1).toFixed(1)))}>+</button><button type="button" onClick={reset}>Ricomponi</button></div></div>}
        </div>
        {!page && <ProjectDetails project={null} projects={projects} headingId={`${id}-details`} />}
        {project && <ProjectPreview project={project} projects={projects} trigger={preview.trigger} pinned={preview.pinned} id={`${id}-preview`} onSelect={selectProject} onClose={closePreview} onKeepOpen={keepOpen} onLeave={leavePreview} />}
      </div>
      {!page && <p className="constellation__legend"><span />Collegamenti tra temi e progetti <span />Caratteristiche condivise</p>}
      {page && <p className="constellation__closing"><em>“Ogni progetto è una stella nel mio universo di codice.” <span aria-hidden="true">🚀</span></em></p>}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{project ? `Selezionato ${project.title}. La scheda del progetto è aperta.` : `${count} progetti nella costellazione.`}</p>
    </section>
  )
}
