import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const MAKIS_STACK = 'JavaScript · Node.js · APIs';

type SceneVariables = CSSProperties & Record<`--${string}`, string>;
type Companion = 'farmer' | 'librarian' | 'sheep' | 'fox';
type Entity = 'makis' | Companion;
type Food = 'coffee' | 'bread' | 'book' | 'wheat' | 'berries';
type Reaction = { target: Entity; item: string; message: string; success: boolean; nonce: number };

type EntityInfo = { label: string; image?: string; food: Food; greetings: readonly string[]; wrong: string };

const food: Record<Food, { label: string; icon: string; target: Entity; hint: string }> = {
  coffee: { label: 'Кава', icon: '☕', target: 'makis', hint: 'для Макіса' },
  bread: { label: 'Хліб', icon: '🍞', target: 'farmer', hint: 'для фермера' },
  book: { label: 'Книга', icon: '📗', target: 'librarian', hint: 'для бібліотекаря' },
  wheat: { label: 'Пшениця', icon: '🌾', target: 'sheep', hint: 'для вівці' },
  berries: { label: 'Ягоди', icon: '🫐', target: 'fox', hint: 'для лисиці' },
};

const entities: Record<Entity, EntityInfo> = {
  makis: { label: 'Макіс', food: 'coffee', greetings: ['Кава заварена — код летить!', 'У Макіса +1 до фокусу.', 'Справжній режим build & brew.'], wrong: 'Макіс зараз мріє лише про каву.' },
  farmer: { label: 'Фермер села', image: '/assets/makis-villager-farmer-v1.png', food: 'bread', greetings: ['Хммм! На полі з’явились паростки.', 'Урожай росте швидше!', 'Фермер зібрав золоте жито.'], wrong: 'Фермер шукає свіжий хліб.' },
  librarian: { label: 'Бібліотекар села', image: '/assets/makis-villager-librarian-v1.png', food: 'book', greetings: ['Хммм! Нова глава відкрита.', 'Бібліотека засяяла знаннями.', 'Рідкісний чарівний том знайдено!'], wrong: 'Бібліотекар просить цікаву книжку.' },
  sheep: { label: 'Вівця', image: '/assets/makis-sheep-v1.png', food: 'wheat', greetings: ['Беее! Вовна стала пухнастішою.', 'Вівця стрибає від радості.', 'Хмарка-вівця створена!'], wrong: 'Вівця любить тільки пшеницю.' },
  fox: { label: 'Руда лисиця', image: '/assets/makis-fox-v1.png', food: 'berries', greetings: ['Чірп! Лисиця принесла блискітку.', 'Хвіст мерехтить у променях.', 'Лисиця знайшла секретну стежку!'], wrong: 'Лисиця винюхує солодкі ягоди.' },
};

function useSceneMotion() {
  const [motion, setMotion] = useState<SceneVariables>({ '--world-x': '0px', '--world-y': '0px', '--glow-x': '0px', '--glow-y': '0px', '--player-x': '0px', '--player-rotate': '0deg', '--player-tilt': '0deg' });
  const animationFrame = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const updateMotion = useCallback(() => {
    const { x, y } = target.current;
    setMotion({ '--world-x': `${(-x * 10).toFixed(1)}px`, '--world-y': `${(-y * 7).toFixed(1)}px`, '--glow-x': `${(-x * 3).toFixed(1)}px`, '--glow-y': `${(-y * 3).toFixed(1)}px`, '--player-x': `${(x * 18).toFixed(1)}px`, '--player-rotate': `${(x * 11).toFixed(1)}deg`, '--player-tilt': `${(-y * 3).toFixed(1)}deg` });
    animationFrame.current = null;
  }, []);
  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    target.current = { x: ((event.clientX / window.innerWidth) - 0.5) * 2, y: ((event.clientY / window.innerHeight) - 0.5) * 2 };
    if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(updateMotion);
  }, [updateMotion]);
  const resetMotion = useCallback(() => {
    target.current = { x: 0, y: 0 };
    if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(updateMotion);
  }, [updateMotion]);
  useEffect(() => () => { if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current); }, []);
  return { motion, handlePointerMove, resetMotion };
}

function Header({ ambient, onToggleAmbient }: { ambient: boolean; onToggleAmbient: () => void }) {
  return <header className="header">
    <a className="brand" href="/" aria-label="Makis home"><span className="brand-cube" />MAKIS</a>
    <p className="status"><i /> JavaScript backend developer</p>
    <button className="sound-button" type="button" onClick={onToggleAmbient} aria-label="Toggle ambient glow" aria-pressed={ambient}><span /><span /><span /></button>
  </header>;
}

function Hearts({ level }: { level: number }) {
  return <span className="hearts" aria-label={'Рівень дружби: ' + level + ' з 3'}>{[1, 2, 3].map((heart) => <span key={heart} className={heart <= level ? 'is-full' : ''}>♥</span>)}</span>;
}

function Reward({ event, target }: { event: Reaction | null; target: Entity }) {
  if (!event || event.target !== target) return null;
  return <span className={'reward-pop ' + (event.success ? 'is-success' : 'is-miss')} role="status"><b>{event.success ? event.item : '…'}</b>{event.message}</span>;
}

function Player({ level, reaction, onFeed }: { level: number; reaction: Reaction | null; onFeed: () => void }) {
  return <button className={['player', 'target-makis', reaction?.target === 'makis' && reaction.success ? 'is-celebrating' : ''].filter(Boolean).join(' ')} type="button" onClick={onFeed} aria-label="Макіс. Натисніть, щоб пригостити.">
    <span className="player-aura" aria-hidden="true" />
    <img src="/assets/makis-character.png" alt="Makis, a block-style character ready for adventure" draggable={false} />
    <span className="player-name"><i /> Makis <small>{level ? 'Coffee mode' : 'Backend dev'}</small></span>
    {level === 3 && <span className="barbell-reward" aria-label="Качалка-трофей"><i /><b /><i /></span>}
    <span className="entity-meter"><Hearts level={level} /></span><Reward event={reaction} target="makis" />
  </button>;
}

function Companion({ id, level, reaction, onFeed }: { id: Companion; level: number; reaction: Reaction | null; onFeed: () => void }) {
  const companion = entities[id];
  const wasFed = reaction?.target === id && reaction.success;
  return <button className={['companion', 'companion-' + id, wasFed ? 'is-celebrating' : '', level === 3 ? 'is-thriving' : ''].filter(Boolean).join(' ')} type="button" onClick={onFeed} aria-label={companion.label + '. Натисніть, щоб пригостити.'}>
    <img src={companion.image} alt="" draggable={false} />
    <span className="companion-label"><b>{companion.label}</b><small>{food[companion.food].icon} {food[companion.food].label} потрібні тут</small><Hearts level={level} /></span>
    <Reward event={reaction} target={id} />
  </button>;
}

function FoodBar({ selected, onSelect, progress }: { selected: Food; onSelect: (item: Food) => void; progress: number }) {
  return <aside className="game-panel" aria-label="Інвентар частувань">
    <div className="game-panel-head"><p>ІНВЕНТАР</p><strong>{progress}/5 друзів</strong></div>
    <div className="food-bar" role="toolbar" aria-label="Оберіть частування">
      {(Object.keys(food) as Food[]).map((item, index) => <button key={item} className={selected === item ? 'is-selected' : ''} type="button" onClick={() => onSelect(item)} aria-pressed={selected === item} aria-label={food[item].label + ', ' + food[item].hint}><b>{food[item].icon}</b><span>{food[item].label}</span><i>{index + 1}</i></button>)}
    </div>
    <p className="feed-instruction">Обрано: <b>{food[selected].icon} {food[selected].label}</b> · тепер клікни {food[selected].hint}</p>
  </aside>;
}

export function App() {
  const { motion, handlePointerMove, resetMotion } = useSceneMotion();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [ambient, setAmbient] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food>('coffee');
  const [levels, setLevels] = useState<Record<Entity, number>>({ makis: 0, farmer: 0, librarian: 0, sheep: 0, fox: 0 });
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const reactionTimer = useRef<number | null>(null);
  useEffect(() => () => { if (reactionTimer.current !== null) window.clearTimeout(reactionTimer.current); }, []);

  const copyStack = async () => { try { await navigator.clipboard.writeText(MAKIS_STACK); setCopyState('copied'); } catch { setCopyState('fallback'); } };
  const feed = (entity: Entity) => {
    const info = entities[entity];
    const isCorrect = food[selectedFood].target === entity;
    const level = levels[entity];
    const success = isCorrect && level < 3;
    const message = isCorrect ? level === 3 ? info.label + ' уже на максимумі!' : info.greetings[level] : info.wrong;
    if (success) setLevels((current) => ({ ...current, [entity]: Math.min(3, current[entity] + 1) }));
    setReaction({ target: entity, item: food[selectedFood].icon, message, success, nonce: Date.now() });
    if (reactionTimer.current !== null) window.clearTimeout(reactionTimer.current);
    reactionTimer.current = window.setTimeout(() => setReaction(null), 2100);
  };

  const progress = (Object.keys(entities) as Entity[]).filter((entity) => levels[entity] > 0).length;
  const buttonLabel = copyState === 'copied' ? 'Stack copied' : 'Copy stack';
  const feedback = copyState === 'copied' ? 'Ready to keep for your next project.' : copyState === 'fallback' ? 'Stack: ' + MAKIS_STACK : '';

  return <main className={['scene', ambient ? 'is-ambient' : '', progress === 5 ? 'is-village-awake' : ''].filter(Boolean).join(' ')} style={motion} onPointerMove={handlePointerMove} onPointerLeave={resetMotion}>
    <div className="world" aria-hidden="true" /><div className="world-wash" aria-hidden="true" /><div className="sun-glow" aria-hidden="true" />
    <div className="spark spark-one" aria-hidden="true" /><div className="spark spark-two" aria-hidden="true" /><div className="spark spark-three" aria-hidden="true" />
    <Header ambient={ambient} onToggleAmbient={() => setAmbient((current) => !current)} />
    <section className="intro" aria-labelledby="title"><p className="eyebrow">JavaScript · Backend · Coffee</p><h1 id="title">CODE.<br />COFFEE.<br /><em>CLARITY.</em></h1><p className="summary">Makis writes JavaScript for dependable backends and believes the best solutions begin with good coffee.</p><button className="join-button" type="button" onClick={copyStack}><span>{buttonLabel}</span><b>↗</b></button><p className="feedback" aria-live="polite">{feedback}</p></section>
    <Player level={levels.makis} reaction={reaction} onFeed={() => feed('makis')} />
    <Companion id="farmer" level={levels.farmer} reaction={reaction} onFeed={() => feed('farmer')} />
    <Companion id="librarian" level={levels.librarian} reaction={reaction} onFeed={() => feed('librarian')} />
    <Companion id="sheep" level={levels.sheep} reaction={reaction} onFeed={() => feed('sheep')} />
    <Companion id="fox" level={levels.fox} reaction={reaction} onFeed={() => feed('fox')} />
    <FoodBar selected={selectedFood} onSelect={setSelectedFood} progress={progress} />
    <aside className="server-card" aria-label="Makis profile"><p>{progress === 5 ? 'VILLAGE GLOWING' : 'NOW BREWING'}</p><strong>{progress === 5 ? 'All friends are fed' : 'Node.js / APIs / DX'}</strong><span>{progress === 5 ? 'The world feels warmer' : 'Calm code, strong coffee'}</span></aside>
    <p className="pointer-hint"><span>↗</span> Обери частування · клікай героїв</p><footer><span>© 2026 Makis</span><span>Built with JavaScript &amp; coffee</span></footer><p className="sr-only" aria-live="polite">{reaction?.message}</p>
  </main>;
}
