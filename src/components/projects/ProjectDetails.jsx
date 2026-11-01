import { projectTopics } from '../../data/projects'
import { relatedProjects } from './graph'

export default function ProjectDetails({ project, projects, onSelect, onClear, headingId }) {
  if (!project) {
    return (
      <aside className="constellation-details constellation-details--intro" aria-labelledby={headingId}>
        <img src="/icon/novenix-master.png" alt="" width="1280" height="1280" className="constellation-details__emblem" />
        <h3 id={headingId}>Ogni progetto è una stella.</h3>
        <p>Esplora il mio universo di codice. Seleziona una stella per vedere il progetto e accendere ciò che condivide con gli altri.</p>
        <p className="constellation-details__hint">I filamenti luminosi raccontano i legami. Le stelle più piccole rappresentano i temi.</p>
      </aside>
    )
  }
  const related = relatedProjects(project, projects)
  return (
    <aside className="constellation-details" aria-labelledby={headingId}>
      <div className="constellation-details__top"><span>{project.status === 'planned' ? 'In sviluppo' : 'Progetto selezionato'}</span><button type="button" onClick={onClear} aria-label="Chiudi il progetto e mostra tutta la costellazione">Chiudi ×</button></div>
      {project.image && <img className="constellation-details__image" src={project.image} alt={project.imageAlt || `Anteprima di ${project.title}`} loading="lazy" decoding="async" />}
      <h3 id={headingId}>{project.title}</h3>
      <p>{project.description}</p>
      <ul className="constellation-details__tags" aria-label="Temi del progetto">{project.topics.map((topic) => <li key={topic}>{projectTopics[topic].label}</li>)}</ul>
      {project.technologies.length > 0 && <div><h4>Tecnologie</h4><ul className="constellation-details__tags">{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></div>}
      {project.contribution && <div><h4>Il mio contributo</h4><p>{project.contribution}</p></div>}
      {(project.repository || project.demo) && <div className="constellation-details__links">{project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Visita il progetto ↗</a>}{project.repository && <a href={project.repository} target="_blank" rel="noreferrer">Codice su GitHub ↗</a>}</div>}
      {related.length > 0 && <div className="constellation-details__related"><h4>Stelle collegate</h4>{related.map(({ project: other, shared }) => <button key={other.id} type="button" onClick={() => onSelect(other.id)}><span>{other.title} ↗</span><small>{shared.map((trait) => trait.label).join(' · ')}</small></button>)}</div>}
    </aside>
  )
}
