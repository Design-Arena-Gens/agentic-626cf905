import { Environment, Sky } from '@react-three/drei'
import Player from './Player'
import Ground from './Ground'
import Enemies from './Enemies'
import Particles from './Particles'

export default function Scene() {
  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#4834df" />

      <Environment preset="sunset" />

      <fog attach="fog" args={['#1a1a2e', 30, 100]} />

      <Ground />
      <Player />
      <Enemies />
      <Particles />
    </>
  )
}
