import { Canvas } from '@react-three/fiber'
import Starfield from './Starfield'
import CameraRig from './CameraRig'

export default function Universe({ reducedMotion }) {
  return (
    // fixed = resta fermo mentre il resto scrolla, è il fondale.
    // pointer-events-none è fondamentale: senza, il canvas ruberebbe
    // click e scroll al contenuto che ci mettiamo sopra.
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* dpr limitato a 2x: sugli schermi ad altissima densità (tipo i telefoni recenti)
          renderizzare a 3x manderebbe in fumo le prestazioni senza benefici visibili */}
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        {/* fog: le stelle lontane sfumano nel blu invece di restare tutte nitide - dà profondità */}
        <fog attach="fog" args={['#081929', 8, 120]} />
        <CameraRig reduced={reducedMotion} />
        <Starfield reduced={reducedMotion} />
      </Canvas>
    </div>
  )
}
