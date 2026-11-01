import { useId, useState } from 'react'
import { skillGroups } from '../data/portfolio'

export function SkillCard({ skill, learning = false, reduced, open = false, onOpenChange }) {
  const id = useId()

  return (
    <article className={`skill-card${learning ? ' skill-card--learning' : ''}${reduced ? ' no-motion' : ''}`} data-open={open} aria-labelledby={`${id}-title`} onPointerEnter={(event) => { if (event.pointerType === 'mouse') onOpenChange(true) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') onOpenChange(false) }}>
      <h4 id={`${id}-title`} className="skill-card__title">{skill.title}</h4>
      <button type="button" className="skill-card__button" aria-label={`${open ? 'Nascondi' : 'Mostra'} descrizione di ${skill.title}`} aria-expanded={open} aria-controls={`${id}-description`} aria-describedby={open ? `${id}-description` : undefined} onClick={() => onOpenChange(!open)} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) onOpenChange(true) }} onBlur={() => onOpenChange(false)} onKeyDown={(event) => { if (event.key === 'Escape') onOpenChange(false) }}>
        <img className="skill-card__image" src={`/media/${skill.asset}`} width="250" height="250" alt={skill.alt} loading="lazy" decoding="async" />
        <span className="skill-card__description font-mono" id={`${id}-description`} aria-hidden={!open}>{skill.description}</span>
      </button>
    </article>
  )
}

export default function Skills({ reduced }) {
  const [activeSkill, setActiveSkill] = useState(null)
  const id = useId()

  return (
    <section id="skills" className="skills font-display" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="main-title">Le mie competenze spaziali</h2>
      {skillGroups.map((group, index) => (
        <div key={group.id} className="skills__group" role="group" aria-labelledby={`${id}-${group.id}`}>
          <h3 id={`${id}-${group.id}`} className={index === 0 ? 'sr-only' : 'skills__group-title'}>{group.title}</h3>
          <div className="skills__grid">
            {group.skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} learning={group.learning} reduced={reduced} open={activeSkill === skill.id} onOpenChange={(open) => setActiveSkill(open ? skill.id : null)} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
