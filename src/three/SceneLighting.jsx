export default function SceneLighting() {
  return (
    <>
      <fog attach="fog" args={['#081929', 17, 253]} />
      <ambientLight intensity={0.12} color="#22456b" />
      <directionalLight position={[10, 10, 10]} intensity={1.8} color="#ffd9a0" />
      <directionalLight position={[-10, -4, -6]} intensity={0.15} color="#3f6ea5" />
    </>
  )
}
