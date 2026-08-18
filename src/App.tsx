import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const SERVER_ADDRESS = 'play.makis.lol';

type SceneVariables = CSSProperties & Record<`--${string}`, string>;

function useSceneMotion() {
  const [motion, setMotion] = useState<SceneVariables>({
    '--world-x': '0px', '--world-y': '0px', '--glow-x': '0px', '--glow-y': '0px',
    '--player-x': '0px', '--player-rotate': '0deg', '--player-tilt': '0deg',
  });
  const animationFrame = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });

  const updateMotion = useCallback(() => {
    const { x, y } = target.current;
    setMotion({
      '--world-x': `${(-x * 10).toFixed(1)}px`,
      '--world-y': `${(-y * 7).toFixed(1)}px`,
      '--glow-x': `${(-x * 3).toFixed(1)}px`,
      '--glow-y': `${(-y * 3).toFixed(1)}px`,
      '--player-x': `${(x * 18).toFixed(1)}px`,
      '--player-rotate': `${(x * 11).toFixed(1)}deg`,
      '--player-tilt': `${(-y * 3).toFixed(1)}deg`,
    });
    animationFrame.current = null;
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    target.current = {
      x: ((event.clientX / window.innerWidth) - 0.5) * 2,
      y: ((event.clientY / window.innerHeight) - 0.5) * 2,
    };
    if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(updateMotion);
  }, [updateMotion]);

  const resetMotion = useCallback(() => {
    target.current = { x: 0, y: 0 };
    if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(updateMotion);
  }, [updateMotion]);

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  return { motion, handlePointerMove, resetMotion };
}

function Header({ ambient, onToggleAmbient }: { ambient: boolean; onToggleAmbient: () => void }) {
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="Makis home"><span className="brand-cube" />MAKIS</a>
      <p className="status"><i /> Survival world online</p>
      <button className="sound-button" type="button" onClick={onToggleAmbient} aria-label="Toggle ambient mode" aria-pressed={ambient}>
        <span /><span /><span />
      </button>
    </header>
  );
}

function Player() {
  return (
    <section className="player" aria-label="Makis, your guide to the world">
      <div className="player-aura" aria-hidden="true" />
      <img src="/assets/makis-character.png" alt="Makis, a block-style character ready for adventure" draggable={false} />
      <p className="player-name"><span /> Makis <small>Founder</small></p>
    </section>
  );
}

export function App() {
  const { motion, handlePointerMove, resetMotion } = useSceneMotion();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [ambient, setAmbient] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_ADDRESS);
      setCopyState('copied');
    } catch {
      setCopyState('fallback');
    }
  };

  const buttonLabel = copyState === 'copied' ? 'Address copied' : 'Enter the world';
  const feedback = copyState === 'copied'
    ? 'Paste it into Minecraft and join us.'
    : copyState === 'fallback' ? `Server address: ${SERVER_ADDRESS}` : '';

  return (
    <main className="scene" style={motion} onPointerMove={handlePointerMove} onPointerLeave={resetMotion}>
      <div className="world" aria-hidden="true" />
      <div className="world-wash" aria-hidden="true" />
      <div className="sun-glow" aria-hidden="true" />
      <div className="spark spark-one" aria-hidden="true" />
      <div className="spark spark-two" aria-hidden="true" />
      <div className="spark spark-three" aria-hidden="true" />

      <Header ambient={ambient} onToggleAmbient={() => setAmbient((current) => !current)} />

      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">A Minecraft survival world</p>
        <h1 id="title">MAKE<br />YOUR<br /><em>MARK.</em></h1>
        <p className="summary">The blocks are waiting. Build the thing you cannot stop thinking about.</p>
        <button className="join-button" type="button" onClick={copyAddress}><span>{buttonLabel}</span><b>↗</b></button>
        <p className="feedback" aria-live="polite">{feedback}</p>
      </section>

      <Player />

      <aside className="server-card" aria-label="Server address">
        <p>JAVA EDITION · 1.21+</p>
        <strong>{SERVER_ADDRESS}</strong>
        <span>Click “Enter” to copy</span>
      </aside>

      <p className="pointer-hint"><span>↗</span> Move your cursor</p>
      <footer><span>© 2026 Makis</span><span>Built for the long game</span></footer>
    </main>
  );
}
