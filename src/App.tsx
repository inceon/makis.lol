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

type Companion = 'farmer' | 'librarian' | 'sheep' | 'fox';

const companions: Record<Companion, {
  label: string;
  detail: string;
  greeting: string;
  image: string;
  role: string;
  bio: string;
  stats: Array<[string, string]>;
}> = {
  farmer: {
    label: 'Фермер села',
    detail: 'Клікни, щоб відкрити профіль.',
    greeting: 'Hmmmm! ✦',
    image: '/assets/makis-villager-farmer-v1.png',
    role: 'Senior crop engineer',
    bio: 'Деплоїть пшеницю щодня о 06:00. Production не падає, бо компост — найкращий rollback.',
    stats: [['Stack', 'Hoe.js + bone meal'], ['Uptime', '99.9% дощу'], ['PR review', '«Хммм»']],
  },
  librarian: {
    label: 'Бібліотекар села',
    detail: 'Клікни, щоб відкрити профіль.',
    greeting: 'Hmmmm! ✦',
    image: '/assets/makis-villager-librarian-v1.png',
    role: 'Staff knowledge engineer',
    bio: 'Знає всі API, але документацію видає лише за смарагди. Його кеш — це полиця з книжками.',
    stats: [['Search engine', 'VillagerDB'], ['Cache policy', 'Librarian LRU'], ['Pricing', '1 emerald / query']],
  },
  sheep: {
    label: 'Вівця',
    detail: 'Клікни, щоб відкрити профіль.',
    greeting: 'Baa! ✦',
    image: '/assets/makis-sheep-v1.png',
    role: 'Cloud infrastructure',
    bio: 'М’яка, горизонтально масштабується й регулярно віддає ресурси. Ніхто не бачив її без whitepaper.',
    stats: [['Cloud provider', 'WoolCompute'], ['Autoscaling', 'після стрижки'], ['Logs', 'баа-баа-баа']],
  },
  fox: {
    label: 'Руда лисиця',
    detail: 'Клікни, щоб відкрити профіль.',
    greeting: 'Chirp! ✦',
    image: '/assets/makis-fox-v1.png',
    role: 'Security engineer',
    bio: 'Знаходить дірки в паркані швидше, ніж команда знаходить баг у проді. Нуль довіри, максимум хвоста.',
    stats: [['Threat model', 'курник'], ['Zero-day', 'щовівторка'], ['VPN', 'Very Pawsome Network']],
  },
};

function Companion({
  id,
  active,
  onClick,
}: {
  id: Companion;
  active: boolean;
  onClick: () => void;
}) {
  const companion = companions[id];

  return (
    <button
      className={`companion companion-${id}${active ? ' is-active' : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${companion.label}. ${companion.detail}`}
    >
      <img src={companion.image} alt="" draggable={false} />
      <span className="companion-label"><b>{companion.label}</b><small>{active ? companion.greeting : companion.detail}</small></span>
    </button>
  );
}

function CompanionProfile({ id, onClose }: { id: Companion; onClose: () => void }) {
  const companion = companions[id];

  return (
    <section className="companion-profile" role="dialog" aria-modal="true" aria-labelledby="companion-title">
      <div className="profile-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="profile-art" aria-hidden="true">
        <div className="profile-grid" />
        <img src={companion.image} alt="" draggable={false} />
      </div>
      <div className="profile-content">
        <button className="profile-close" type="button" onClick={onClose} autoFocus aria-label="Закрити профіль">×</button>
        <p className="profile-kicker">// entity.profile</p>
        <h2 id="companion-title">{companion.label}</h2>
        <p className="profile-role">{companion.role}</p>
        <p className="profile-bio">{companion.bio}</p>
        <dl className="profile-stats">
          {companion.stats.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}
        </dl>
        <p className="profile-footer"><span /> status: online, трохи піксельний</p>
      </div>
    </section>
  );
}

export function App() {
  const { motion, handlePointerMove, resetMotion } = useSceneMotion();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [ambient, setAmbient] = useState(false);
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCompanion(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const copyStack = async () => {
    try {
      await navigator.clipboard.writeText(MAKIS_STACK);
      setCopyState('copied');
    } catch {
      setCopyState('fallback');
    }
  };

  const buttonLabel = copyState === 'copied' ? 'Stack copied' : 'Copy stack';
  const feedback = copyState === 'copied'
    ? 'Ready to keep for your next project.'
    : copyState === 'fallback' ? `Stack: ${MAKIS_STACK}` : '';

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
        <h1 id="title">CODE.<br />COFFEE.<br /><em>CLARITY.</em></h1>
        <p className="summary">Makis writes JavaScript for dependable backends and believes the best solutions begin with good coffee.</p>
        <button className="join-button" type="button" onClick={copyStack}><span>{buttonLabel}</span><b>↗</b></button>
        <p className="feedback" aria-live="polite">{feedback}</p>
      </section>

      <Player />
      <Companion id="farmer" active={activeCompanion === 'farmer'} onClick={() => setActiveCompanion((current) => current === 'farmer' ? null : 'farmer')} />
      <Companion id="librarian" active={activeCompanion === 'librarian'} onClick={() => setActiveCompanion((current) => current === 'librarian' ? null : 'librarian')} />
      <Companion id="sheep" active={activeCompanion === 'sheep'} onClick={() => setActiveCompanion((current) => current === 'sheep' ? null : 'sheep')} />
      <Companion id="fox" active={activeCompanion === 'fox'} onClick={() => setActiveCompanion((current) => current === 'fox' ? null : 'fox')} />

      <aside className="server-card" aria-label="Makis profile">
        <p>NOW BREWING</p>
        <strong>Node.js / APIs / DX</strong>
        <span>Calm code, strong coffee</span>
      </aside>

      <p className="pointer-hint"><span>↗</span> Рухай курсор · клікай персонажів</p>
      <footer><span>© 2026 Makis</span><span>Built with JavaScript &amp; coffee</span></footer>
      {activeCompanion && <CompanionProfile id={activeCompanion} onClose={() => setActiveCompanion(null)} />}
    </main>
  );
}
