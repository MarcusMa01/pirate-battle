
import { useEffect, useRef, useState } from 'react'
import { Application, Graphics } from 'pixi.js'

interface GameProps {
  onExit: () => void
  onComplete: (result: GameResult) => void
  onRestart: () => void
  duration: number
  spawnInterval: number
  saveStatus: 'idle' | 'saving' | 'saved' | 'failed'
}

type EnemyType = 'chaser' | 'shooter'
type EndReason = 'time' | 'health'

interface Enemy {
  graphic: Graphics
  type: EnemyType
  hp: number
  maxHp: number
  cooldown: number
}

interface Bullet {
  graphic: Graphics
  vx: number
  vy: number
  life: number
  owner: 'player' | 'enemy'
  damage: number
}

interface Effect {
  graphic: Graphics
  life: number
  maxLife: number
}

export interface GameResult {
  score: number
  played: number
  reason: 'time' | 'health'
}

const CONFIG = {
  playerHp: 100,
  playerSpeed: 210,
  rotationSpeed: 2.7,
  playerDamage: 35,
  enemyDamage: 12,
  bulletSpeed: 470,
  bulletLife: 1.8,
  frontCooldown: 0.24,
  sideCooldown: 0.8,
  chaserSpeed: 85,
  shooterSpeed: 65,
  shooterRange: 280,
  shooterCooldown: 1.6,
  islandRadius: 65,
  shipRadius: 19,
  enemyRadius: 18,
}

const distance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.hypot(x2 - x1, y2 - y1)

function makeShip(color: string) {
  return new Graphics()
    .poly([0, -24, 17, 20, 0, 12, -17, 20])
    .fill(color)
    .stroke({ color: '#34251a', width: 3 })
}

function makeHealthBar(hp: number, maxHp: number) {
  const bar = new Graphics()
  const ratio = Math.max(0, hp / maxHp)

  bar.rect(-22, -37, 44, 6).fill('#401d23')
  bar.rect(-22, -37, 44 * ratio, 6)
    .fill(ratio > 0.35 ? '#61df83' : '#ff6262')

  return bar
}

export default function Game({
  onExit,
  onComplete,
  duration,
  spawnInterval,
  saveStatus,
}: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hud, setHud] = useState({
    score: 0,
    hp: CONFIG.playerHp,
    time: duration,
  })
  const [paused, setPaused] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [round, setRound] = useState(0)

  const pausedRef = useRef(false)
  const finishedRef = useRef(false)
  const touchKeysRef = useRef<Record<string, boolean>>({})

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  function pressTouchKey(key: string) {
    if (finishedRef.current || pausedRef.current) return

    touchKeysRef.current[key] = true
  }

  function releaseTouchKey(key: string) {
    touchKeysRef.current[key] = false
  }

  function togglePause() {
    if (finishedRef.current) return

    pausedRef.current = !pausedRef.current

    if (pausedRef.current) {
      touchKeysRef.current = {}
    }

    setPaused(pausedRef.current)
  }

  function restart() {
    touchKeysRef.current = {}
    pausedRef.current = false
    finishedRef.current = false
    setPaused(false)
    setResult(null)
    setHud({ score: 0, hp: CONFIG.playerHp, time: duration })
    setRound((previous) => previous + 1)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const host: HTMLDivElement = container

    let cancelled = false
    let pixi: Application | null = null
    let cleanupGame: (() => void) | undefined

    async function initialize() {
      const app = new Application()

      try {
        await app.init({
          background: '#07536b',
          resizeTo: host,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        })
      } catch (error) {
        console.error('PixiJS initialization failed:', error)
        return
      }

      if (cancelled) {
        app.destroy(true, { children: true })
        return
      }

      pixi = app
      host.appendChild(app.canvas)

      const keys: Record<string, boolean> = {}
      const isPressed = (key: string) =>
        Boolean(keys[key] || touchKeysRef.current[key])
      const enemies: Enemy[] = []
      const bullets: Bullet[] = []
      const effects: Effect[] = []

      const islandX = () => app.screen.width * 0.32
      const islandY = () => app.screen.height * 0.35

      const island = new Graphics()
        .circle(0, 0, CONFIG.islandRadius)
        .fill('#b59a54')
        .stroke({ color: '#594a2d', width: 5 })

      app.stage.addChild(island)

      const player = makeShip('#e7b65d')
      player.position.set(
        app.screen.width * 0.65,
        app.screen.height * 0.65,
      )
      app.stage.addChild(player)

      let hp = CONFIG.playerHp
      let score = 0
      let elapsed = 0
      let spawnTimer = 0
      let frontCooldown = 0
      let sideCooldown = 0
      let hudTimer = 0
      let active = true
      let nextEnemy: EnemyType = 'chaser'

      const playerBar = makeHealthBar(hp, CONFIG.playerHp)
      app.stage.addChild(playerBar)

      function updateHealthBars() {
        const ratio = Math.max(0, hp / CONFIG.playerHp)

        playerBar.clear()
        playerBar.rect(-22, -37, 44, 6).fill('#401d23')
        playerBar
          .rect(-22, -37, 44 * ratio, 6)
          .fill(ratio > 0.35 ? '#61df83' : '#ff6262')

        playerBar.position.set(player.x, player.y)
      }

      function createEffect(x: number, y: number, color: string) {
        const graphic = new Graphics()
          .circle(0, 0, 17)
          .fill({ color, alpha: 0.7 })

        graphic.position.set(x, y)
        app.stage.addChild(graphic)
        effects.push({ graphic, life: 0.3, maxLife: 0.3 })
      }

      function removeBullet(index: number) {
        const bullet = bullets[index]
        app.stage.removeChild(bullet.graphic)
        bullet.graphic.destroy()
        bullets.splice(index, 1)
      }

      function removeEnemy(index: number) {
        const enemy = enemies[index]
        createEffect(enemy.graphic.x, enemy.graphic.y, '#ff9b45')
        app.stage.removeChild(enemy.graphic)
        enemy.graphic.destroy({ children: true })
        enemies.splice(index, 1)
      }

      function fire(
        x: number,
        y: number,
        angle: number,
        owner: 'player' | 'enemy',
      ) {
        const graphic = new Graphics()
          .circle(0, 0, owner === 'player' ? 5 : 6)
          .fill(owner === 'player' ? '#ffd166' : '#ff6464')

        graphic.position.set(x, y)
        app.stage.addChild(graphic)

        bullets.push({
          graphic,
          vx: Math.sin(angle) * CONFIG.bulletSpeed,
          vy: -Math.cos(angle) * CONFIG.bulletSpeed,
          life: CONFIG.bulletLife,
          owner,
          damage:
            owner === 'player'
              ? CONFIG.playerDamage
              : CONFIG.enemyDamage,
        })
      }

      function fireSide(side: number) {
        const direction = player.rotation + side * Math.PI / 2

        for (let i = -1; i <= 1; i++) {
          const offset = i * 15
          const x = player.x + Math.sin(player.rotation) * offset
          const y = player.y - Math.cos(player.rotation) * offset

          fire(x, y, direction, 'player')
        }
      }

      function spawnEnemy() {
        const width = app.screen.width
        const height = app.screen.height
        const margin = 35

        for (let attempt = 0; attempt < 40; attempt++) {
          const x = margin + Math.random() * Math.max(1, width - margin * 2)
          const y = margin + Math.random() * Math.max(1, height - margin * 2)

          if (
            distance(x, y, player.x, player.y) < 180 ||
            distance(x, y, islandX(), islandY()) <
              CONFIG.islandRadius + CONFIG.enemyRadius + 15
          ) {
            continue
          }

          const type = nextEnemy
          nextEnemy = type === 'chaser' ? 'shooter' : 'chaser'

          const graphic = makeShip(
            type === 'chaser' ? '#f16a6a' : '#b69aff',
          )

          graphic.position.set(x, y)
          graphic.addChild(makeHealthBar(60, 60))
          app.stage.addChild(graphic)

          enemies.push({
            graphic,
            type,
            hp: 60,
            maxHp: 60,
            cooldown: 0.8,
          })

          return
        }
      }


function endGame(reason: EndReason) {
  if (!active) return

  active = false
  finishedRef.current = true
  pausedRef.current = false

  const finalResult: GameResult = {
    score,
    played: Math.min(duration, Math.floor(elapsed)),
    reason,
  }

  setHud({
    score,
    hp: Math.max(0, hp),
    time: Math.max(0, Math.ceil(duration - elapsed)),
  })

  setResult(finalResult)

  onCompleteRef.current(finalResult)
}


      function handleKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase()

        if (
          [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
        ) {
          event.preventDefault()
        }

        if (key === 'p' && !event.repeat && active) {
          pausedRef.current = !pausedRef.current
          setPaused(pausedRef.current)
        }

        keys[key] = true
      }

      function handleKeyUp(event: KeyboardEvent) {
        keys[event.key.toLowerCase()] = false
      }

      function handleBlur() {
        if (active) {
          pausedRef.current = true
          setPaused(true)
        }
        Object.keys(keys).forEach((key) => delete keys[key])
        touchKeysRef.current = {}
      }

      function handleVisibility() {
        if (document.hidden) handleBlur()
      }

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
      window.addEventListener('blur', handleBlur)
      document.addEventListener('visibilitychange', handleVisibility)

      const update = (ticker: { deltaMS: number }) => {
        if (!active || pausedRef.current) return

        const dt = Math.min(ticker.deltaMS / 1000, 0.05)
        const width = app.screen.width
        const height = app.screen.height

        island.position.set(islandX(), islandY())

        elapsed += dt
        spawnTimer += dt
        hudTimer += dt
        frontCooldown -= dt
        sideCooldown -= dt

        if (elapsed >= duration) {
          endGame('time')
          return
        }

        // Player rotation
        if (isPressed('a') || keys['arrowleft']) {
          player.rotation -= CONFIG.rotationSpeed * dt
        }
        if (isPressed('d') || keys['arrowright']) {
          player.rotation += CONFIG.rotationSpeed * dt
        }

        // Player movement
        let movement = 0
        if (isPressed('w') || keys['arrowup']) movement = 1
        if (isPressed('s') || keys['arrowdown']) movement = -0.65

        const previousX = player.x
        const previousY = player.y

        player.x +=
          Math.sin(player.rotation) * CONFIG.playerSpeed * movement * dt
        player.y -=
          Math.cos(player.rotation) * CONFIG.playerSpeed * movement * dt

        player.x = Math.max(
          CONFIG.shipRadius,
          Math.min(width - CONFIG.shipRadius, player.x),
        )
        player.y = Math.max(
          CONFIG.shipRadius,
          Math.min(height - CONFIG.shipRadius, player.y),
        )

        if (
          distance(player.x, player.y, islandX(), islandY()) <
          CONFIG.islandRadius + CONFIG.shipRadius
        ) {
          player.position.set(previousX, previousY)
        }

        // Player weapons
        if (isPressed(' ') && frontCooldown <= 0) {
          fire(player.x, player.y, player.rotation, 'player')
          frontCooldown = CONFIG.frontCooldown
        }

        if (isPressed('q') && sideCooldown <= 0) {
          fireSide(-1)
          sideCooldown = CONFIG.sideCooldown
        }

        if (isPressed('e') && sideCooldown <= 0) {
          fireSide(1)
          sideCooldown = CONFIG.sideCooldown
        }

        // Spawn enemies
        if (spawnTimer >= spawnInterval) {
          spawnTimer = 0
          spawnEnemy()
        }

        // Enemy AI
        for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i]
          const graphic = enemy.graphic

          const dx = player.x - graphic.x
          const dy = player.y - graphic.y
          const dist = Math.hypot(dx, dy)

          const angle = Math.atan2(dx, -dy)
          graphic.rotation = angle

          const shouldMove =
            enemy.type === 'chaser' ||
            dist > CONFIG.shooterRange * 0.7

          if (shouldMove && dist > 1) {
            const speed =
              enemy.type === 'chaser'
                ? CONFIG.chaserSpeed
                : CONFIG.shooterSpeed

            const oldX = graphic.x
            const oldY = graphic.y

            graphic.x += (dx / dist) * speed * dt
            graphic.y += (dy / dist) * speed * dt

            graphic.x = Math.max(18, Math.min(width - 18, graphic.x))
            graphic.y = Math.max(18, Math.min(height - 18, graphic.y))

            if (
              distance(graphic.x, graphic.y, islandX(), islandY()) <
              CONFIG.islandRadius + CONFIG.enemyRadius
            ) {
              graphic.position.set(oldX, oldY)
            }
          }

          if (
            enemy.type === 'chaser' &&
            distance(graphic.x, graphic.y, player.x, player.y) < 35
          ) {
            hp -= 25
            createEffect(player.x, player.y, '#ff5656')
            removeEnemy(i)
            continue
          }

          enemy.cooldown -= dt

          if (
            enemy.type === 'shooter' &&
            dist < CONFIG.shooterRange &&
            enemy.cooldown <= 0
          ) {
            fire(graphic.x, graphic.y, angle, 'enemy')
            enemy.cooldown = CONFIG.shooterCooldown
          }
        }

        // Bullets and collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i]
          const graphic = bullet.graphic

          graphic.x += bullet.vx * dt
          graphic.y += bullet.vy * dt
          bullet.life -= dt

          if (
            bullet.life <= 0 ||
            graphic.x < 0 ||
            graphic.x > width ||
            graphic.y < 0 ||
            graphic.y > height ||
            distance(graphic.x, graphic.y, islandX(), islandY()) <
              CONFIG.islandRadius
          ) {
            removeBullet(i)
            continue
          }

          if (bullet.owner === 'enemy') {
            if (
              distance(graphic.x, graphic.y, player.x, player.y) <
              CONFIG.shipRadius + 5
            ) {
              hp -= bullet.damage
              createEffect(graphic.x, graphic.y, '#ff6464')
              removeBullet(i)
            }
            continue
          }

          let hit = false

          for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j]

            if (
              distance(
                graphic.x,
                graphic.y,
                enemy.graphic.x,
                enemy.graphic.y,
              ) < CONFIG.enemyRadius + 5
            ) {
              enemy.hp -= bullet.damage
              createEffect(graphic.x, graphic.y, '#ffd166')

              if (enemy.hp <= 0) {
                score += 1
                removeEnemy(j)
              } else {
                const oldBar = enemy.graphic.children[0]
                if (oldBar) {
                  enemy.graphic.removeChild(oldBar)
                  oldBar.destroy()
                }
                enemy.graphic.addChild(
                  makeHealthBar(enemy.hp, enemy.maxHp),
                )
              }

              removeBullet(i)
              hit = true
              break
            }
          }

          if (hit) continue
        }

        // Explosion effects
        for (let i = effects.length - 1; i >= 0; i--) {
          const effect = effects[i]
          effect.life -= dt
          effect.graphic.alpha = Math.max(0, effect.life / effect.maxLife)
          effect.graphic.scale.set(1 + (1 - effect.life / effect.maxLife))

          if (effect.life <= 0) {
            app.stage.removeChild(effect.graphic)
            effect.graphic.destroy()
            effects.splice(i, 1)
          }
        }

        updateHealthBars()

        if (hp <= 0) {
          hp = 0
          endGame('health')
          return
        }

        if (hudTimer >= 0.15) {
          hudTimer = 0
          setHud({
            score,
            hp: Math.max(0, hp),
            time: Math.ceil(duration - elapsed),
          })
        }
      }

      app.ticker.add(update)

      cleanupGame = () => {
        app.ticker.remove(update)
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
        window.removeEventListener('blur', handleBlur)
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }

    void initialize()

    return () => {
      cancelled = true
      touchKeysRef.current = {}
      cleanupGame?.()

      if (pixi) {
        pixi.destroy(true, { children: true })
      }
    }
  }, [duration, spawnInterval, round])

  return (
    <div className="game-wrapper">
      <div className="game-toolbar">
        <span>⚓ PIRATE BATTLE</span>
        <button onClick={onExit}>EXIT GAME</button>
      </div>

      <div className="battle-hud">
        <span>🏆 SCORE: {hud.score}</span>
        <span>❤️ HEALTH: {hud.hp}</span>
        <span>⏱ TIME: {hud.time}s</span>
        <button
          onClick={togglePause}
          disabled={result !== null}
        >
          {paused ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      <div className="game-arena" ref={containerRef} />

      <p className="game-controls">
        W/S: Move · A/D: Rotate · SPACE: Front cannon ·
        Q: Left volley · E: Right volley · P: Pause
      </p>


<div className="touch-controls">
  <div className="touch-movement">
    <button
      aria-label="Move forward"
      onPointerDown={() => pressTouchKey('w')}
      onPointerUp={() => releaseTouchKey('w')}
      onPointerCancel={() => releaseTouchKey('w')}
      onPointerLeave={() => releaseTouchKey('w')}
    >
      ▲
    </button>

    <div className="touch-row">
      <button
        aria-label="Rotate left"
        onPointerDown={() => pressTouchKey('a')}
        onPointerUp={() => releaseTouchKey('a')}
        onPointerCancel={() => releaseTouchKey('a')}
        onPointerLeave={() => releaseTouchKey('a')}
      >
        ↶
      </button>

      <button
        aria-label="Move backward"
        onPointerDown={() => pressTouchKey('s')}
        onPointerUp={() => releaseTouchKey('s')}
        onPointerCancel={() => releaseTouchKey('s')}
        onPointerLeave={() => releaseTouchKey('s')}
      >
        ▼
      </button>

      <button
        aria-label="Rotate right"
        onPointerDown={() => pressTouchKey('d')}
        onPointerUp={() => releaseTouchKey('d')}
        onPointerCancel={() => releaseTouchKey('d')}
        onPointerLeave={() => releaseTouchKey('d')}
      >
        ↷
      </button>
    </div>
  </div>

  <div className="touch-weapons">
    <button
      onPointerDown={() => pressTouchKey(' ')}
      onPointerUp={() => releaseTouchKey(' ')}
      onPointerCancel={() => releaseTouchKey(' ')}
      onPointerLeave={() => releaseTouchKey(' ')}
    >
      FIRE
    </button>

    <div className="touch-row">
      <button
        onPointerDown={() => pressTouchKey('q')}
        onPointerUp={() => releaseTouchKey('q')}
        onPointerCancel={() => releaseTouchKey('q')}
        onPointerLeave={() => releaseTouchKey('q')}
      >
        LEFT
      </button>

      <button
        onPointerDown={() => pressTouchKey('e')}
        onPointerUp={() => releaseTouchKey('e')}
        onPointerCancel={() => releaseTouchKey('e')}
        onPointerLeave={() => releaseTouchKey('e')}
      >
        RIGHT
      </button>
    </div>
  </div>
</div>


      {result && (
        <div className="result-overlay">
          <div className="result-panel">
            <h2>🏴‍☠️ BATTLE FINISHED</h2>
            <p>Score: {result.score}</p>
            <p>Played time: {result.played}s</p>
            <p className="save-status">
              {saveStatus === 'saving' && '⏳ Saving match...'}
              {saveStatus === 'saved' && '✓ Match saved successfully!'}
              {saveStatus === 'failed' && '⚠ Failed to save match.'}
              {saveStatus === 'idle' && 'Preparing match record...'}
            </p>
            <p>
              End reason:{' '}
              {result.reason === 'health'
                ? 'Ship destroyed'
                : 'Time expired'}
            </p>
            <button className="primary-button" onClick={restart}>
              PLAY AGAIN
            </button>
            <button onClick={onExit}>MAIN MENU</button>
          </div>
        </div>
      )}
    </div>
  )
}
