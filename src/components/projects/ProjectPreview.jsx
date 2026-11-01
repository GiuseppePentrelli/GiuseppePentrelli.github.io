import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ProjectDetails from './ProjectDetails'

export default function ProjectPreview({ project, projects, trigger, pinned, id, onSelect, onClose, onKeepOpen, onLeave }) {
  const ref = useRef(null)

  useEffect(() => {
    if (pinned) ref.current.querySelector('button')?.focus({ preventScroll: true })
  }, [pinned, trigger])

  useLayoutEffect(() => {
    const position = () => {
      const panel = ref.current
      const anchor = trigger.getBoundingClientRect()
      const gap = 12
      const margin = 16
      const width = panel.offsetWidth
      const height = panel.offsetHeight
      const roomOnRight = anchor.right + gap + width <= window.innerWidth - margin
      const preferredLeft = roomOnRight ? anchor.right + gap : anchor.left - width - gap
      const left = Math.max(margin, Math.min(window.innerWidth - width - margin, preferredLeft))
      const top = Math.max(margin, Math.min(window.innerHeight - height - margin, anchor.top - 24))
      panel.style.left = `${left}px`
      panel.style.top = `${top}px`
    }
    const observer = new ResizeObserver(position)
    observer.observe(ref.current)
    position()
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
    }
  }, [trigger])

  useEffect(() => {
    const outside = (event) => {
      if (!ref.current.contains(event.target) && !trigger.contains(event.target)) onClose()
    }
    const escape = (event) => {
      if (event.key !== 'Escape') return
      const restoreFocus = ref.current.contains(document.activeElement)
      event.preventDefault()
      onClose(restoreFocus)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [trigger, onClose])

  return createPortal(
    <div ref={ref} id={id} role="dialog" aria-modal="false" aria-labelledby={`${id}-title`} className="project-preview font-display" onPointerEnter={onKeepOpen} onPointerLeave={onLeave} onFocusCapture={onKeepOpen} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onLeave() }}>
      <ProjectDetails project={project} projects={projects} onSelect={onSelect} onClear={() => onClose(true)} headingId={`${id}-title`} />
    </div>,
    document.body,
  )
}
