import { planets } from '../three/planetsData'
import { skillGroups } from '../data/portfolio'

export const categories = ['Tutti', 'Pianeti', 'Cielo', 'Fenomeni', 'Visitatori', 'Esperimenti', 'Interfaccia', 'Illustrazioni', 'Archivio']

export const catalog = [
  { id: 'projects', title: 'Costellazione dei progetti', description: 'Stelle selezionabili, filtri e connessioni tra i progetti. Esperimento ispirato al grafo di Obsidian.', category: 'Interfaccia', kind: 'dom', demo: 'projects', wide: true, interactive: true, status: 'review', source: 'src/components/projects/ProjectConstellation.jsx' },
  ...planets.map((planet) => ({
    id: planet.name,
    title: planet.name[0].toUpperCase() + planet.name.slice(1),
    category: 'Pianeti',
    kind: 'planet',
    planet,
    source: 'src/three/Planet.jsx · planetsData.js',
    description: planet.ring ? 'Rotazione, anelli e atmosfera.' : 'Superficie cartoon, rotazione e atmosfera.',
  })),
  ...[
    ['stars', 'Stelle di base', 'Il fondale comune a tutte le anteprime.', 'Starfield'],
    ['twinkles', 'Stelle scintillanti', 'Scintille a quattro punte, ognuna con il suo ritmo.', 'Twinkles'],
    ['dust', 'Polvere spaziale', 'Il flusso di particelle vicino alla camera.', 'SpaceDust'],
    ['nebula', 'Nebulosa', 'Le due nuvole di luce sul fondale.', 'Nebula'],
    ['camera', 'Parallasse della camera', 'Muovi il puntatore per guardarti intorno.', 'CameraRig'],
  ].map(([id, title, description, component]) => ({ id, title, description, category: 'Cielo', kind: id, source: `src/three/${component}.jsx` })),
  ...[
    ['blackhole', 'Buco nero', 'Disco di accrescimento, plasma e nucleo sfumato.', 'BlackHole'],
    ['binary', 'Stelle binarie', 'Due stelle in orbita con superfici e corone animate.', 'BinaryStars'],
    ['eclipse', 'Eclissi', 'La luna passa davanti alla stella.', 'Eclipse'],
    ['warm-star', 'Stella ambra', 'La superficie stellare e la corona, isolate.', 'StellarBody'],
    ['blue-star', 'Stella azzurra', 'La seconda variante di colore delle stelle binarie.', 'StellarBody'],
    ['nova', 'Nova', 'Lampo e onda d’urto. Premi Riproduci per avviare il flash.', 'Nova', true],
    ['shooting', 'Stella cadente', 'Il passaggio veloce con la sua scia.', 'ShootingStar', true],
    ['comet', 'Grande cometa', 'Nucleo, chioma e coda durante il passaggio.', 'GreatComet', true],
    ['asteroids', 'Asteroidi', 'Il gruppo di otto sassi, con crateri e spin indipendenti.', 'Asteroids', true],
  ].map(([id, title, description, component, event = false]) => ({ id, title, description, category: 'Fenomeni', kind: id, source: `src/three/${component}.jsx`, event })),
  ...[
    ['astronaut', 'Astronauta alla deriva', 'lostInTheSpace.webp'],
    ['alien', 'Alieno', 'alien.avif'],
    ['satellite', 'Satellite', 'satellite.avif'],
  ].map(([id, title, asset]) => ({ id, title, category: 'Visitatori', kind: 'wanderer', asset, source: 'src/three/SpaceWanderer.jsx', description: 'Movimento e rotazione dello sprite originale.' })),
  { id: 'ufo', title: 'UFO', category: 'Visitatori', kind: 'ufo', source: 'src/three/Ufo.jsx', description: 'Ingresso, fluttuazione e fuga verso l’alto.', event: true },
  { id: 'rocket', title: 'Razzo 3D', category: 'Visitatori', kind: 'rocket', source: 'src/three/Rocket.jsx', description: 'Modello cartoon, rotazione e fiamma animata.', event: true },
  ...[
    ['space-station', 'Stazione spaziale', 'station', 'Anello abitato rotante, pannelli solari e stemma Novenix.', 'SpaceStation', 'approved'],
    ['asteroid-rover', 'Rover sull’asteroide', 'rover', 'Sei ruote in movimento, testa orientabile e una piccola superficie da esplorare.', 'AsteroidRover', 'review'],
    ['space-probe', 'Sonda esploratrice', 'probe', 'Pannelli solari, antenna orientabile e deriva nello spazio.', 'SpaceProbe', 'approved'],
  ].map(([id, title, kind, description, component, status]) => ({ id, title, kind, description, status, category: 'Esperimenti', source: `src/three/experiments/${component}.jsx` })),
  ...[
    ['hero', 'Benvenuto', 'Titolo al neon, nome, avatar e frecce.', 'Hero'],
    ['journey', 'Introduzione al viaggio', 'Il titolo che apre il viaggio interstellare.', 'JourneyIntro'],
    ['about', 'Chi sono', 'Foto con orbite, console e scheda missione.', 'About'],
    ['services', 'Carosello servizi', 'I sei servizi originali e l’alieno addormentato sui comandi.', 'ServicesCarousel'],
    ['skills', 'Competenze spaziali', 'La sezione completa con le illustrazioni originali.', 'Skills'],
    ['porthole', 'Vetro dell’oblò', 'Riflesso, vignettatura, linee e puntini lungo i bordi.', 'PortholeOverlay'],
    ['motion-toggle', 'Controllo del movimento', 'Il pulsante originale per ridurre le animazioni.', 'ReducedMotionToggle'],
  ].map(([id, title, description, component]) => ({ id, title, description, category: 'Interfaccia', kind: 'dom', demo: id, source: `src/components/${component}.jsx` })),
  ...skillGroups.flatMap((group) => group.skills.map((skill) => ({ id: `skill-${skill.id}`, title: `Competenza · ${skill.title}`, description: skill.description, category: 'Interfaccia', kind: 'dom', demo: 'skill', skill, learning: group.learning, source: 'src/components/Skills.jsx' }))),
  ...[
    ['cabin-desktop', 'Cabina desktop', 'cockpit-novenix-v1.png'],
    ['cabin-desktop-cartoon', 'Cabina desktop · Cartoon', 'cockpit-novenix-cartoon-v2.png'],
    ['cabin-mobile', 'Cabina mobile', 'cockpit-novenix-mobile-v1.png'],
    ['cabin-mobile-cartoon', 'Cabina mobile · Cartoon', 'cockpit-novenix-cartoon-mobile-v2.png'],
  ].map(([id, title, asset]) => ({ id, title, category: 'Interfaccia', kind: 'image', asset, source: `public/media/${asset}`, description: 'La cabina con il finestrino trasparente.' })),
  ...[
    ['welcome-avatar', 'Avatar di benvenuto', 'welcomeMe.avif'],
    ['profile-avatar', 'Ritratto sulla luna', 'fotoProfilo.avif'],
    ['orbit-planet-1', 'Pianeta decorativo 1', 'planet1.avif'],
    ['orbit-planet-2', 'Pianeta decorativo 2', 'planet2.avif'],
    ['orbit-satellite-2', 'Satellite decorativo 2', 'satellite2.avif'],
    ['orbit-star-1', 'Stella decorativa 1', 'star.avif'],
    ['orbit-star-2', 'Stella decorativa 2', 'star2.avif'],
  ].map(([id, title, asset]) => ({ id, title, category: 'Illustrazioni', kind: 'image', asset, source: `public/media/${asset}`, description: 'Illustrazione originale, isolata sul cielo di Novenix.' })),
  ...[
    ['old-ufo', 'UFO alternativo', 'ufo1.avif'],
    ['old-asteroid', 'Asteroide illustrato', 'asteroid.png'],
    ['old-background', 'Sfondo illustrato', 'welcomeImg.avif'],
    ['welcome-avatar-mobile', 'Avatar mobile', 'welcomeMe-mobile.avif'],
  ].map(([id, title, asset]) => ({ id, title, category: 'Archivio', kind: 'image', asset, source: `public/media/${asset}`, description: id === 'welcome-avatar-mobile' ? 'Versione leggera usata sui telefoni.' : 'Risorsa presente nel progetto, non usata nella scena attuale.' })),
]
