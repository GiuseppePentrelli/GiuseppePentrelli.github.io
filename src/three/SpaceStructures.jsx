import SpaceStation from './experiments/SpaceStation'
import SpaceProbe from './experiments/SpaceProbe'
import { isPortrait, placeAt, useAspect } from './layout'

const structures = [
  {
    id: 'station',
    Model: SpaceStation,
    anchor: [-0.2, 0.8],
    portraitAnchor: [0.55, -0.05],
    distance: 132,
    scale: 2,
    portraitScale: 1.25,
  },
  {
    id: 'probe',
    Model: SpaceProbe,
    anchor: [-0.6, 0.2],
    portraitAnchor: [0.68, -0.83],
    distance: 54,
    scale: 0.7,
    portraitScale: 0.5,
  },
]

export default function SpaceStructures({ reduced }) {
  const aspect = useAspect()
  const portrait = isPortrait(aspect)

  return structures.map(({ id, Model, anchor, portraitAnchor, distance, scale, portraitScale }) => (
    <group key={id} position={placeAt(portrait ? portraitAnchor : anchor, distance, aspect)} scale={portrait ? portraitScale : scale}>
      <Model reduced={reduced} />
    </group>
  ))
}
