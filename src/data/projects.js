export const projectTopics = {
  formazione: { label: 'Formazione', color: '#ffc54d', position: [360, 130] },
  interfacce: { label: 'Interfacce', color: '#7fe3ff', position: [820, 410] },
  gaming: { label: 'Gaming', color: '#c4a1ff', position: [710, 600] },
}

export const projects = [
  {
    id: 'e-portfolio-studente', title: 'E-portfolio studente',
    image: '/media/projects/e-portfolio-studente.webp',
    imageAlt: 'Illustrazione del portfolio: il passaggio dalle forbici al codice.',
    description: 'Portfolio scolastico per l’Esame di Stato 2026–2027, in costruzione con Vue. Include lo scheletro della home e uno Style Lab per sperimentare l’interfaccia.',
    topics: ['formazione', 'interfacce'], technologies: ['Vue', 'Vite', 'CSS'],
    position: [255, 250], compactPosition: [290, 215], color: '#ffc54d',
    repository: 'https://github.com/GiuseppePentrelli/e-portfolio-studente',
    demo: 'https://giuseppepentrelli.github.io/e-portfolio-studente/',
  },
  {
    id: 'components', title: 'Componenti custom',
    image: '/media/projects/components.png',
    imageAlt: 'La Ford Mustang utilizzata nel componente Cars Card.',
    description: 'Una raccolta di componenti UI costruiti a mano in HTML, CSS e JavaScript. Ogni componente ha una pagina dedicata e può essere incorporato in altri siti.',
    topics: ['interfacce'], technologies: ['HTML', 'CSS', 'JavaScript'],
    position: [740, 250], compactPosition: [720, 450], color: '#7fe3ff',
    repository: 'https://github.com/GiuseppePentrelli/components',
    demo: 'https://giuseppepentrelli.github.io/components/',
  },
  {
    id: 'novenix-games', title: 'Novenix Games',
    description: 'La sala giochi di Novenix: un portale arcade dedicato ai miei giochi per il browser. La prima avventura è The Legend of Aulab, un runner tra bug da schivare e monete da raccogliere.',
    image: '/media/projects/novenix-games.png',
    imageAlt: 'Il salone in pixel art di The Legend of Aulab.',
    topics: ['gaming', 'interfacce'], technologies: ['HTML', 'CSS', 'JavaScript', 'Vue', 'Kaplay'],
    position: [500, 580], compactPosition: [470, 565], color: '#c4a1ff',
    repository: 'https://github.com/GiuseppePentrelli/novenix-games',
    demo: 'https://giuseppepentrelli.github.io/novenix-games/',
  },
]
