import Planet from './Planet'
import { planets } from './planetsData'
import { isPortrait, placeAt, useAspect } from './layout'

export default function Planets({ reduced }) {
  const aspect = useAspect()
  const portrait = isPortrait(aspect)

  return planets.map(({ anchor, distance, portrait: alt, size, orbitRadius = 0, ...p }) => {
    const useAlt = portrait && alt
    const scale = useAlt ? (alt.scale ?? 1) : 1
    return (
      <Planet
        key={p.name}
        {...p}
        size={size * scale}
        orbitRadius={orbitRadius * scale}
        orbitCenter={placeAt(useAlt ? (alt.anchor ?? anchor) : anchor, distance, aspect)}
        reduced={reduced}
      />
    )
  })
}
