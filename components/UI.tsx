'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export default function UI() {
  const { health, energy, combo } = useGameStore()
  const [showCombo, setShowCombo] = useState(false)

  useEffect(() => {
    if (combo > 0) {
      setShowCombo(true)
      const timer = setTimeout(() => setShowCombo(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [combo])

  return (
    <div className="game-ui">
      {/* Health Bar */}
      <div className="health-bar">
        <div className="health-bar-bg">
          <div
            className="health-bar-fill"
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      {/* Energy Bar */}
      <div className="energy-bar">
        <div className="energy-bar-bg">
          <div
            className="energy-bar-fill"
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>

      {/* Combo Counter */}
      {showCombo && combo > 0 && (
        <div className="combo-counter">
          {combo}x COMBO!
        </div>
      )}

      {/* Crosshair */}
      <div className="crosshair" />

      {/* Controls */}
      <div className="controls">
        <h3>Controls</h3>
        <div>WASD / Arrows - Move</div>
        <div>Space - Jump</div>
        <div>J / Click - Fire Attack (10 energy)</div>
        <div>K - Ice Multi-shot (30 energy)</div>
        <div>L - Lightning Nova (50 energy)</div>
      </div>
    </div>
  )
}
