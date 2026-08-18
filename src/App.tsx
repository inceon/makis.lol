import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const MAKIS_STACK = 'JavaScript · Node.js · APIs';

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
      <p className="status"><i /> JavaScript backend developer</p>
      <button className="sound-button" type="button" onClick={onToggleAmbient} aria-label="Toggle ambient glow" aria-pressed={ambient}>
        <span /><span /><span />
      </button>
    </header>
  );
}

function Player() {
  return (
    <section className="player" aria-label="Makis, JavaScript backend developer">
      <div className="player-aura" aria-hidden="true" />
      <img src="/assets/makis-character.png" alt="Makis, a block-style character ready for adventure" draggable={false} />
      <p className="player-name"><span /> Makis <small>Backend dev</small></p>
    </section>
  );
}

type Companion = 'animals' | 'villagers';

function Companion({
  id,
  active,
  onClick,
}: {
  id: Companion;
  active: boolean;
  onClick: () => void;
}) {
  const isAnimals = id === 'animals';
  const label = isAnimals ? 'Лисичка та вівця' : 'Пекар і садівниця';
  const detail = isAnimals ? 'Натисни — вони привітаються.' : 'Натисни — вони покажуть свій настрій.';

  return (
    <button
      className={`companion companion-${id}${active ? ' is-active' : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label}. ${detail}`}
    >
      <img src={isAnimals ? '/assets/makis-animals-v1.png' : '/assets/makis-villagers-v1.png'} alt="" draggable={false} />
      <span className="companion-label"><b>{label}</b><small>{active ? (isAnimals ? 'Пік-пік! ✦' : 'Свіжий хліб! ✦') : detail}</small></span>
    </button>
  );
}

export function App() {
  const { motion, handlePointerMove, resetMotion } = useSceneMotion();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [ambient, setAmbient] = useState(false);
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);

  const copyStack = async () => {
    try {
      await navigator.clipboard.writeText(MAKIS_STACK);
      setCopyState('copied');
    } catch {
      setCopyState('fallback');
    }
  };

  const buttonLabel = copyState === 'copied' ? 'Стек скопійовано' : 'Скопіювати стек';
  const feedback = copyState === 'copied'
    ? 'Готово — можна зберегти для наступного проєкту.'
    : copyState === 'fallback' ? `Стек: ${MAKIS_STACK}` : '';

  return (
    <main className={`scene${ambient ? ' is-ambient' : ''}`} style={motion} onPointerMove={handlePointerMove} onPointerLeave={resetMotion}>
      <div className="world" aria-hidden="true" />
      <div className="world-wash" aria-hidden="true" />
      <div className="sun-glow" aria-hidden="true" />
      <div className="spark spark-one" aria-hidden="true" />
      <div className="spark spark-two" aria-hidden="true" />
      <div className="spark spark-three" aria-hidden="true" />

      <Header ambient={ambient} onToggleAmbient={() => setAmbient((current) => !current)} />

      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">JavaScript · Backend · Coffee</p>
        <h1 id="title">КОД.<br />КАВА.<br /><em>СЕНС.</em></h1>
        <p className="summary">Макіс пише JavaScript для надійних бекендів і вірить, що найкращі рішення починаються з кавусі.</p>
        <button className="join-button" type="button" onClick={copyStack}><span>{buttonLabel}</span><b>↗</b></button>
        <p className="feedback" aria-live="polite">{feedback}</p>
      </section>

      <Player />
      <Companion id="animals" active={activeCompanion === 'animals'} onClick={() => setActiveCompanion((current) => current === 'animals' ? null : 'animals')} />
      <Companion id="villagers" active={activeCompanion === 'villagers'} onClick={() => setActiveCompanion((current) => current === 'villagers' ? null : 'villagers')} />

      <aside className="server-card" aria-label="Makis profile">
        <p>NOW BREWING</p>
        <strong>Node.js / APIs / DX</strong>
        <span>Спокійний код, міцна кава</span>
      </aside>

      <p className="pointer-hint"><span>↗</span> Рухай курсор · натискай героїв</p>
      <footer><span>© 2026 Makis</span><span>Built with JavaScript &amp; кавуся</span></footer>
    </main>
  );
}
