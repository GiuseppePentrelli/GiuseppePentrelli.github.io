import { useEffect, useRef } from 'react'
import { Stars } from '@react-three/drei'

export default function Starfield({ reduced }) {
  const farRef = useRef(null)
  const nearRef = useRef(null)

  useEffect(() => {
    const materials = [farRef.current.material, nearRef.current.material]
    return () => materials.forEach((material) => material.dispose())
  }, [])

  return (
    <>
      {/* layer lontano: tante stelle piccole, quasi ferme */}
      <Stars ref={farRef} radius={150} depth={80} count={16000} factor={2} saturation={0} fade speed={reduced ? 0 : 0.1} />
      {/* layer vicino: poche stelle più grandi, si muovono di più - dà profondità */}
      <Stars ref={nearRef} radius={60} depth={30} count={6000} factor={3} saturation={0} fade speed={reduced ? 0 : 0.3} />
    </>
  )
}
