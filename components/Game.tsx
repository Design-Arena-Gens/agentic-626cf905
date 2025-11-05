'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react'
import Scene from './Scene'
import UI from './UI'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  attack = 'attack',
  skill = 'skill',
  ultimate = 'ultimate',
}

const keyboardMap = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.attack, keys: ['KeyJ', 'Mouse0'] },
  { name: Controls.skill, keys: ['KeyK'] },
  { name: Controls.ultimate, keys: ['KeyL'] },
]

export default function Game() {
  return (
    <>
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <Physics gravity={[0, -20, 0]}>
              <Scene />
            </Physics>
            <EffectComposer>
              <Bloom
                intensity={0.5}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.9}
              />
              <DepthOfField
                focusDistance={0.01}
                focalLength={0.05}
                bokehScale={3}
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <UI />
    </>
  )
}
