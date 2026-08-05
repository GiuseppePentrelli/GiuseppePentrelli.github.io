import Planet from './Planet'
import { planets } from './planetsData'

export default function Planets({ reduced }) {
  return planets.map((p) => <Planet key={p.name} {...p} reduced={reduced} />)
}
