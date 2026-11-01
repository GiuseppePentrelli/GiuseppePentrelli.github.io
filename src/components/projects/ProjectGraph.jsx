import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildGraph, CORE, GRAPH_HEIGHT, GRAPH_WIDTH, linkPath, matchesFilter, relatedProjects } from './graph'

function GraphBoard({ projects, compact, selected, hovered, filter, zoom, resetVersion, onSelect, onPreview, onFilter, onReset, previewId }) {
  const boardRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const pathRefs = useRef(new Map())
  const positions = useRef(new Map())
  const size = useRef({ width: 0, height: 0 })
  const drag = useRef(null)
  const frame = useRef(0)
  const suppressClick = useRef(null)
  const previousReset = useRef(resetVersion)
  const { nodes, links } = useMemo(() => buildGraph(projects, compact), [projects, compact])
  for (const node of nodes) if (!positions.current.has(node.id)) positions.current.set(node.id, [...node.position])

  const visibleProjects = projects.filter((project) => matchesFilter(project, filter))
  const visible = new Set([CORE.id, ...visibleProjects.map((project) => project.id), ...visibleProjects.flatMap((project) => project.topics.map((topic) => `topic:${topic}`))])
  const focusId = hovered || selected || (filter !== 'all' ? filter : null)
  const focused = new Set()
  if (focusId?.startsWith('topic:') || focusId?.startsWith('tech:')) {
    focused.add(CORE.id)
    focused.add(focusId)
    projects.filter((project) => matchesFilter(project, focusId)).forEach((project) => focused.add(project.id))
  } else {
    const project = projects.find((project) => project.id === focusId)
    if (project) {
      focused.add(CORE.id)
      focused.add(project.id)
      project.topics.forEach((topic) => focused.add(`topic:${topic}`))
      relatedProjects(project, projects).forEach(({ project }) => focused.add(project.id))
    }
  }
  const transformFor = useCallback((node) => {
    const point = positions.current.get(node.id)
    const x = ((point[0] - GRAPH_WIDTH / 2) * zoom + GRAPH_WIDTH / 2 - node.position[0]) / GRAPH_WIDTH * size.current.width
    const y = ((point[1] - GRAPH_HEIGHT / 2) * zoom + GRAPH_HEIGHT / 2 - node.position[1]) / GRAPH_HEIGHT * size.current.height
    return `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
  }, [zoom])

  const paint = useCallback(() => {
    for (const node of nodes) {
      const element = nodeRefs.current.get(node.id)
      if (element) element.style.transform = transformFor(node)
    }
    for (const link of links) pathRefs.current.get(link.id)?.setAttribute('d', linkPath(positions.current.get(link.source), positions.current.get(link.target), link.kind))
  }, [nodes, links, transformFor])

  useEffect(() => {
    const measure = () => {
      size.current = { width: boardRef.current.clientWidth, height: boardRef.current.clientHeight }
      paint()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(boardRef.current)
    measure()
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); frame.current = 0 }
  }, [paint])

  useEffect(() => {
    if (previousReset.current === resetVersion) return
    previousReset.current = resetVersion
    for (const node of nodes) positions.current.set(node.id, [...node.position])
    paint()
  }, [resetVersion, nodes, paint])

  const move = (event) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    const dx = event.clientX - current.x
    const dy = event.clientY - current.y
    if (Math.hypot(dx, dy) < 4 && !current.moved) return
    current.moved = true
    positions.current.set(current.id, [
      Math.max(85, Math.min(915, current.start[0] + dx / size.current.width * GRAPH_WIDTH / zoom)),
      Math.max(70, Math.min(630, current.start[1] + dy / size.current.height * GRAPH_HEIGHT / zoom)),
    ])
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      frame.current = 0
      paint()
    })
  }
  const end = (event) => {
    if (drag.current?.pointerId !== event.pointerId) return
    if (drag.current.moved) suppressClick.current = drag.current.id
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div ref={boardRef} className="constellation__board" role="group" aria-label="Grafo dei progetti: seleziona una stella per esplorare le connessioni">
      <svg className="constellation__filaments" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
        <g transform={`translate(500 350) scale(${zoom}) translate(-500 -350)`}>
          {links.filter((link) => visible.has(link.source) && visible.has(link.target)).map((link) => {
            const lit = focused.size === 0 || (focused.has(link.source) && focused.has(link.target))
            return <path key={link.id} ref={(node) => { if (node) pathRefs.current.set(link.id, node); else pathRefs.current.delete(link.id) }} d={linkPath(positions.current.get(link.source), positions.current.get(link.target), link.kind)} className={`constellation__filament constellation__filament--${link.kind}`} data-lit={lit} vectorEffect="non-scaling-stroke" />
          })}
        </g>
      </svg>
      {nodes.filter((node) => visible.has(node.id)).map((node) => (
        <button
          key={node.id}
          ref={(element) => { if (element) nodeRefs.current.set(node.id, element); else nodeRefs.current.delete(node.id) }}
          type="button"
          data-project-id={node.kind === 'project' ? node.id : undefined}
          aria-haspopup={node.kind === 'project' ? 'dialog' : undefined}
          aria-expanded={node.kind === 'project' ? selected === node.id : undefined}
          aria-controls={node.kind === 'project' && selected === node.id ? previewId : undefined}
          className={`constellation-node constellation-node--${node.kind}${node.status === 'planned' ? ' constellation-node--planned' : ''}`}
          style={{ left: `${node.position[0] / 10}%`, top: `${node.position[1] / 7}%`, color: node.color, transform: transformFor(node) }}
          data-lit={focused.size === 0 || focused.has(node.id)}
          data-selected={selected === node.id || filter === node.id}
          aria-label={node.kind === 'core' ? 'Novenix: mostra tutti i progetti' : node.kind === 'topic' ? `Filtra per ${node.title}` : `${node.title}, ${node.status === 'planned' ? 'in sviluppo' : 'apri progetto'}`}
          aria-pressed={node.kind === 'topic' ? filter === node.id : node.kind === 'project' ? selected === node.id : undefined}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') onPreview(node.id, event.currentTarget, 'pointer') }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !drag.current) onPreview(null, event.currentTarget, 'pointer') }}
          onFocus={(event) => onPreview(node.id, event.currentTarget, 'focus')}
          onBlur={(event) => onPreview(null, event.currentTarget, 'focus')}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && selected === node.id) {
              event.preventDefault()
              document.getElementById(previewId)?.querySelector('button, a')?.focus()
            }
          }}
          onPointerDown={(event) => {
            if (compact || event.pointerType !== 'mouse' || event.button !== 0 || node.kind === 'core') return
            drag.current = { id: node.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: [...positions.current.get(node.id)], moved: false }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={(event) => { end(event); suppressClick.current = null }}
          onLostPointerCapture={() => { drag.current = null }}
          onClick={() => {
            const suppressed = suppressClick.current === node.id
            suppressClick.current = null
            if (suppressed) return
            if (node.kind === 'core') onReset()
            else if (node.kind === 'topic') onFilter(filter === node.id ? 'all' : node.id)
            else onSelect(node.id)
          }}
        >
          {node.kind === 'core' ? <img src="/icon/favicon-v2-96.png" alt="" width="96" height="96" /> : <span className="constellation-node__star" aria-hidden="true" />}
          <span className="constellation-node__label">{node.title}</span>
        </button>
      ))}
    </div>
  )
}

export default function ProjectGraph(props) {
  const frameRef = useRef(null)
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 600))
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={frameRef} className={`constellation__graph${compact ? ' constellation__graph--compact' : ''}`}><GraphBoard key={compact ? 'compact' : 'wide'} compact={compact} {...props} /></div>
}
