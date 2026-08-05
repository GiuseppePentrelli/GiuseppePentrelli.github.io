import { Canvas } from '@react-three/fiber'
import Starfield from './Starfield'
import CameraRig from './CameraRig'
import ShootingStar from './ShootingStar'
import Planets from './Planets'

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
        {/* luci: ambientale bassa apposta, altrimenti il lato in ombra dei pianeti non si scurisce
            mai abbastanza e ruotando non si vede la differenza tra lato illuminato e lato in ombra */}
        <ambientLight intensity={0.18} color="#22456b" />
        <directionalLight position={[10, 10, 10]} intensity={1.8} color="#ffd9a0" />
        <directionalLight position={[-10, -4, -6]} intensity={0.15} color="#3f6ea5" />
        <CameraRig reduced={reducedMotion} />
        <Starfield reduced={reducedMotion} />
        <ShootingStar reduced={reducedMotion} />
        <Planets reduced={reducedMotion} />
      </Canvas>
    </div>
  )
}
