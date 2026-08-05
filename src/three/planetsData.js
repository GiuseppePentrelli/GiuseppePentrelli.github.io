// dati dei pianeti separati dal rendering (Planets.jsx): aggiungerne uno nuovo
// significa solo aggiungere un oggetto qui, zero modifiche alla logica
//
// principi seguiti per la profondità "vista dall'oblò":
// 1. vicino = grande, lontano = piccolo (size cala insieme a orbitCenter[2] più negativo)
// 2. un quadrante ciascuno (alto-dx, alto-sx, basso-dx, basso-sx), uno vicino al centro
//    per bilanciare, uno spinto verso il bordo per l'effetto "sbuca guardandosi intorno"
// 3. axialTilt diverso per ognuno: le bande sono strisce di latitudine, senza un'inclinazione
//    propria sembrerebbero tutte orientate uguali (Marte/Luna hanno macchie sparse, meno critico)
export const planets = [
  {
    name: 'giove',
    orbitCenter: [32, -20, -36],
    orbitRadius: 3,
    orbitSpeed: 0.08,
    orbitPhase: 2,
    size: 4.5,
    variant: 'bands',
    colors: ['#ffb84d', '#fff0dc', '#ff7a1a', '#ffc94d', '#ff7a1a'],
    spotColor: '#e8432b',
    glowColor: '#ffb066',
    speed: 0.25,
    axialTilt: 0.15,
  },
  {
    name: 'terra',
    orbitCenter: [-24, 15, -28],
    orbitRadius: 3.5,
    orbitSpeed: 0.15,
    orbitPhase: 3,
    size: 2.0,
    variant: 'craters',
    colors: ['#3a86c8', '#5fbf6f', '#eef6f8'],
    glowColor: '#6cc9ff',
    speed: 0.3,
    axialTilt: 0.6,
  },
  {
    name: 'luna',
    orbitCenter: [-4, -11, -20],
    orbitRadius: 4,
    orbitSpeed: 0.18,
    orbitPhase: 0,
    size: 1.3,
    variant: 'craters',
    colors: ['#f5e3d3', '#8fe6c4', '#f5b942'],
    glowColor: '#f5e3d3',
    speed: 0.4,
    axialTilt: 0.3,
  },
  {
    name: 'saturno',
    orbitCenter: [38, 24, -45],
    orbitRadius: 3.5,
    orbitSpeed: 0.12,
    orbitPhase: 4,
    size: 2.4,
    variant: 'bands',
    colors: ['#e8d2a0', '#d9b97a', '#f0e2c0', '#c9a465'],
    glowColor: '#e8d2a0',
    ring: { colors: ['#ff9d6c', '#ffd76c', '#8fe6c4', '#6cc9ff', '#c792ea'] },
    speed: 0.3,
    axialTilt: 0.9,
  },
  // spinto verso il bordo sinistro: su schermi stretti resta parzialmente tagliato,
  // si scopre del tutto guardandosi intorno col mouse
  {
    name: 'marte',
    orbitCenter: [-34, -3, -30],
    orbitRadius: 3,
    orbitSpeed: 0.22,
    orbitPhase: 1,
    size: 1.0,
    variant: 'craters',
    colors: ['#d9603a', '#a83f22', '#f2915c'],
    glowColor: '#e8703f',
    speed: 0.5,
    axialTilt: 0.45,
  },
  {
    name: 'nettuno',
    orbitCenter: [-32, -22, -32],
    orbitRadius: 2.5,
    orbitSpeed: 0.1,
    orbitPhase: 5,
    size: 1.7,
    variant: 'bands',
    // più chiaro e saturo del blu di sfondo/fog, altrimenti sparisce
    colors: ['#5b7fe0', '#8fadf0', '#3c66c8', '#7fe3ff'],
    glowColor: '#7fe3ff',
    speed: 0.35,
    axialTilt: 1.1,
  },
  {
    name: 'urano',
    orbitCenter: [14, -32, -52], // basso-destra, più lontano/piccolo degli altri: accento di sfondo
    orbitRadius: 2,
    orbitSpeed: 0.14,
    orbitPhase: 6,
    size: 1.0,
    variant: 'bands',
    colors: ['#bfe8e0', '#d8f5ef', '#9fd8cf'],
    glowColor: '#bfe8e0',
    ring: { colors: ['#cfeee8', '#eafaf5', '#a9d8cf'], tilt: 1.0 },
    speed: 0.45,
    axialTilt: 1.0, 
  },
]
