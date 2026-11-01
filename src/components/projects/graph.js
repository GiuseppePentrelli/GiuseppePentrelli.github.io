import { projectTopics } from '../../data/projects'

export const GRAPH_WIDTH = 1000
export const GRAPH_HEIGHT = 700
export const CORE = { id: 'novenix', title: 'Novenix', position: [500, 355], color: '#ffc54d', kind: 'core' }

export function sharedTraits(a, b) {
  return [
    ...a.topics.filter((topic) => b.topics.includes(topic)).map((topic) => ({ id: `topic:${topic}`, label: projectTopics[topic].label })),
    ...a.technologies.filter((technology) => b.technologies.includes(technology)).map((technology) => ({ id: `tech:${technology}`, label: technology })),
  ]
}

export function relatedProjects(project, projects) {
  return projects.filter((candidate) => candidate.id !== project.id).map((candidate) => ({ project: candidate, shared: sharedTraits(project, candidate) })).filter((match) => match.shared.length > 0)
}

export function matchesFilter(project, filter) {
  if (filter === 'all') return true
  const [type, value] = filter.split(':')
  return type === 'topic' ? project.topics.includes(value) : project.technologies.includes(value)
}

export function buildGraph(projects, compact = false) {
  const nodes = [CORE, ...projects.map((project) => ({ ...project, kind: 'project', position: compact ? project.compactPosition : project.position }))]
  const links = projects.map((project) => ({ id: `portfolio-${project.id}`, source: 'novenix', target: project.id, kind: 'portfolio' }))
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const shared = sharedTraits(projects[i], projects[j])
      if (shared.length) links.push({ id: `shared-${projects[i].id}-${projects[j].id}`, source: projects[i].id, target: projects[j].id, kind: 'shared', shared })
    }
  }
  if (!compact) {
    for (const [id, topic] of Object.entries(projectTopics)) {
      nodes.push({ id: `topic:${id}`, title: topic.label, position: topic.position, color: topic.color, kind: 'topic' })
      for (const project of projects.filter((project) => project.topics.includes(id))) {
        links.push({ id: `${project.id}-${id}`, source: project.id, target: `topic:${id}`, kind: 'topic' })
      }
    }
  }
  return { nodes, links }
}

export function linkPath(from, to, kind) {
  const bend = kind === 'shared' ? 0.16 : 0.07
  const cx = (from[0] + to[0]) / 2 - (to[1] - from[1]) * bend
  const cy = (from[1] + to[1]) / 2 + (to[0] - from[0]) * bend
  return `M ${from[0]} ${from[1]} Q ${cx} ${cy} ${to[0]} ${to[1]}`
}
