import { Stars } from '@react-three/drei'

export default function Starfield({ reduced }) {
  return (
    <>
      {/* layer lontano: tante stelle piccole, quasi ferme */}
      <Stars radius={150} depth={80} count={4000} factor={2} saturation={0} fade speed={reduced ? 0 : 0.1} />
      {/* layer vicino: poche stelle più grandi, si muovono di più - dà profondità */}
      <Stars radius={60} depth={30} count={1500} factor={3} saturation={0} fade speed={reduced ? 0 : 0.3} />
    </>
  )
}
