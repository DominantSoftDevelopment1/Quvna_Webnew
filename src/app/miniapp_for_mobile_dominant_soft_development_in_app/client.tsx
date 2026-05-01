"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────── */
type Theme = "dark" | "light";

interface MiniApp {
  id: number; name: string; description: string;
  icon?: string; img?: string; color: string; cat: string;
  isNew: boolean; isHot: boolean; plays: string; gameKey: string;
}

/* ─── Data ───────────────────────────────────────────── */
const CATS = [
  { id: "all",    label: "Barchasi"    },
  { id: "games",  label: "O'yinlar"   },
  { id: "apps",   label: "Ilovalar"   },
  { id: "arcade", label: "Arkada"     },
  { id: "puzzle", label: "Boshqotirma"},
];

const MINI_APPS: MiniApp[] = [
  { id: 1, name: "2048",        description: "Raqamlarni birlashtir, 2048 ga yet!",  icon: "🎮", color: "#1D3A34", cat: "puzzle", isNew: false, isHot: true,  plays: "124K", gameKey: "2048"      },
  { id: 2, name: "Snake",       description: "Klassik ilon o'yini",                   icon: "🐍", color: "#1A2E1A", cat: "arcade", isNew: false, isHot: false, plays: "89K",  gameKey: "snake"     },
  { id: 3, name: "Tic Tac Toe", description: "Do'sting bilan X-O o'yna",             icon: "❌", color: "#1C1C2E", cat: "games",  isNew: true,  isHot: false, plays: "45K",  gameKey: "tictactoe" },
  { id: 4, name: "Memory Cards",description: "Juft kartalarni top",                   icon: "🃏", color: "#2E1A1A", cat: "puzzle", isNew: true,  isHot: false, plays: "32K",  gameKey: "memory"    },
  { id: 5, name: "Flappy Bird", description: "Qushni uchir, to'siqlardan o't",       icon: "🐦", color: "#1A2535", cat: "arcade", isNew: false, isHot: true,  plays: "210K", gameKey: "flappy"    },
  { id: 6, name: "Quiz Master", description: "Bilimingizni sinab ko'ring",            icon: "🧠", color: "#2A1A35", cat: "apps",   isNew: true,  isHot: false, plays: "18K",  gameKey: "quiz"      },
];

/* ─── Theme vars ─────────────────────────────────────── */
const LIGHT_VARS: React.CSSProperties = {
  "--bg-dark":      "#f0f0f0",
  "--bg-card":      "#ffffff",
  "--bg-card2":     "#f5f5f5",
  "--bg-hover":     "#e8e8e8",
  "--text-primary": "#141414",
  "--text-secondary":"#3d3d3d",
  "--text-muted":   "#666666",
  "--text-inactive":"#999999",
  "--border":       "#d4d4d4",
  "--primary-muted":"rgba(3,255,147,0.12)",
} as React.CSSProperties;

/* ─── Main component ─────────────────────────────────── */
export function MiniAppWebviewClient({ theme }: { theme: Theme }) {
  const [activeCat, setActiveCat] = useState("all");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<MiniApp | null>(null);

  const filtered = activeCat === "all" ? MINI_APPS : MINI_APPS.filter((a) => a.cat === activeCat);
  const hot      = MINI_APPS.filter((a) => a.isHot);
  const newApps  = MINI_APPS.filter((a) => a.isNew);

  const openGame = (app: MiniApp) => { setActiveGame(app.gameKey); setActiveApp(app); };
  const closeGame = () => { setActiveGame(null); setActiveApp(null); };

  const themeStyle: React.CSSProperties = {
    background: "var(--bg-dark)",
    color: "var(--text-primary)",
    minHeight: "100dvh",
    ...(theme === "light" ? LIGHT_VARS : {}),
  };

  /* ── Game view ── */
  if (activeGame && activeApp) {
    return (
      <div style={themeStyle}>
        <div className="game-page-header" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <button type="button" className="game-back-btn" onClick={closeGame} aria-label="Orqaga">
            <span style={{ fontSize: 20, lineHeight: 1 }}>←</span>
          </button>
          <div className="game-page-icon" style={{ "--app-color": activeApp.color } as React.CSSProperties}>
            <span className="game-page-emoji">{activeApp.icon}</span>
          </div>
          <div>
            <h1 className="game-page-title">{activeApp.name}</h1>
            <p className="game-page-desc">{activeApp.description}</p>
          </div>
        </div>
        <div className="game-page-body">
          <GameRenderer gameKey={activeGame} />
        </div>
      </div>
    );
  }

  /* ── Listing view ── */
  return (
    <div style={themeStyle}>
      <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {/* Category bar */}
        <div className="miniapp-cat-bar">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCat(c.id)}
              className={`miniapp-cat-tab${activeCat === c.id ? " active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto pb-8">
          {activeCat !== "all" ? (
            <div className="pt-4">
              <div className="miniapp-list">
                {filtered.map((app) => <MiniAppCard key={app.id} app={app} onPlay={openGame} />)}
              </div>
            </div>
          ) : (
            <>
              <div className="section-title-wrap">
                <h2 className="section-title-text">Mashhur o'yinlar</h2>
              </div>
              <div className="miniapp-list">
                {hot.map((app) => <MiniAppCard key={app.id} app={app} onPlay={openGame} />)}
              </div>

              <div className="section-title-wrap">
                <h2 className="section-title-text">Yangilar</h2>
              </div>
              <div className="miniapp-list">
                {newApps.map((app) => <MiniAppCard key={app.id} app={app} onPlay={openGame} />)}
              </div>

              <div className="section-title-wrap">
                <h2 className="section-title-text">Barcha ilovalar</h2>
              </div>
              <div className="miniapp-grid">
                {MINI_APPS.map((app) => <MiniAppGridCard key={app.id} app={app} onPlay={openGame} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── App cards ──────────────────────────────────────── */
function MiniAppCard({ app, onPlay }: { app: MiniApp; onPlay: (a: MiniApp) => void }) {
  return (
    <div className="miniapp-list-card" onClick={() => onPlay(app)} style={{ cursor: "pointer" }}>
      <div className="miniapp-list-icon" style={{ "--app-color": app.color } as React.CSSProperties}>
        {app.img
          ? <img src={app.img} alt={app.name} className="miniapp-list-img" />
          : <span className="miniapp-list-emoji">{app.icon}</span>}
      </div>
      <div className="miniapp-list-info">
        <div className="miniapp-list-name-row">
          <span className="miniapp-list-name">{app.name}</span>
          <div className="flex gap-1">
            {app.isHot && <span className="miniapp-badge hot">🔥 Trend</span>}
            {app.isNew && <span className="miniapp-badge new">Yangi</span>}
          </div>
        </div>
        <p className="miniapp-list-desc line-clamp-1">{app.description}</p>
        <p className="miniapp-list-plays">{app.plays} o'yin</p>
      </div>
      <button type="button" className="miniapp-play-btn" onClick={(e) => { e.stopPropagation(); onPlay(app); }}>
        O'yna
      </button>
    </div>
  );
}

function MiniAppGridCard({ app, onPlay }: { app: MiniApp; onPlay: (a: MiniApp) => void }) {
  return (
    <div className="miniapp-app-card" onClick={() => onPlay(app)} style={{ cursor: "pointer" }}>
      <div className="miniapp-app-icon-wrap" style={{ "--app-color": app.color } as React.CSSProperties}>
        {app.img
          ? <img src={app.img} alt={app.name} className="miniapp-list-img" />
          : <span className="miniapp-grid-emoji">{app.icon}</span>}
      </div>
      <p className="miniapp-app-name line-clamp-1">{app.name}</p>
      <p className="miniapp-app-tag">{app.plays} o'yin</p>
    </div>
  );
}

/* ─── Game renderer ──────────────────────────────────── */
function GameRenderer({ gameKey }: { gameKey: string }) {
  switch (gameKey) {
    case "2048":      return <Game2048 />;
    case "tictactoe": return <GameTicTacToe />;
    case "memory":    return <GameMemory />;
    case "quiz":      return <GameQuiz />;
    case "snake":     return <GameSnake />;
    case "flappy":    return <GameFlappy />;
    default:          return <div className="game-coming"><p className="game-coming-text">O'yin topilmadi</p></div>;
  }
}

/* ════════════════════════════════════════
   2048
════════════════════════════════════════ */
function Game2048() {
  const empty = (): number[][] => Array(4).fill(null).map(() => Array(4).fill(0));

  function addRandom(board: number[][]): number[][] {
    const empties: [number, number][] = [];
    board.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]); }));
    if (!empties.length) return board;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const next = board.map((row) => [...row]);
    next[r][c] = Math.random() < 0.9 ? 2 : 4;
    return next;
  }

  function initBoard() { let b = empty(); b = addRandom(b); return addRandom(b); }

  const [board, setBoard] = useState<number[][]>(initBoard);
  const [score, setScore] = useState(0);
  const [won,   setWon]   = useState(false);

  function slideRow(row: number[]): { row: number[]; pts: number } {
    const filtered = row.filter((v) => v);
    let pts = 0;
    const merged: number[] = [];
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const val = filtered[i] * 2; merged.push(val); pts += val; i += 2;
      } else { merged.push(filtered[i]); i++; }
    }
    while (merged.length < 4) merged.push(0);
    return { row: merged, pts };
  }

  const move = useCallback((dir: "left" | "right" | "up" | "down") => {
    setBoard((prev) => {
      let b = prev.map((r) => [...r]);
      let totalPts = 0; let moved = false;
      const rotR = (m: number[][]) => m[0].map((_, i) => m.map((r) => r[i]).reverse());
      const rotL = (m: number[][]) => m[0].map((_, i) => m.map((r) => r[r.length - 1 - i]));
      if (dir === "right") b = rotR(rotR(b));
      if (dir === "up")    b = rotL(b);
      if (dir === "down")  b = rotR(b);
      b = b.map((row) => {
        const { row: newRow, pts } = slideRow(row);
        if (newRow.join() !== row.join()) moved = true;
        totalPts += pts; return newRow;
      });
      if (dir === "right") b = rotR(rotR(b));
      if (dir === "up")    b = rotR(b);
      if (dir === "down")  b = rotL(b);
      if (!moved) return prev;
      if (b.flat().includes(2048)) setWon(true);
      setScore((s) => s + totalPts);
      return addRandom(b);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); move("left");  }
      if (e.key === "ArrowRight") { e.preventDefault(); move("right"); }
      if (e.key === "ArrowUp")    { e.preventDefault(); move("up");    }
      if (e.key === "ArrowDown")  { e.preventDefault(); move("down");  }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const tileColor: Record<number, string> = {
    0:"transparent",2:"#eee4da",4:"#ede0c8",8:"#f2b179",16:"#f59563",
    32:"#f67c5f",64:"#f65e3b",128:"#edcf72",256:"#edcc61",512:"#edc850",
    1024:"#edc53f",2048:"#03FF93",
  };

  return (
    <div className="game2048-wrap">
      <div className="game2048-score-row">
        <span className="game2048-score">Ball: {score}</span>
        <button type="button" className="miniapp-play-btn"
          onClick={() => { setBoard(initBoard()); setScore(0); setWon(false); }}>
          Qayta
        </button>
      </div>
      {won && <p className="game2048-won">🎉 2048 ga yetdingiz!</p>}
      <div className="game2048-grid">
        {board.flat().map((v, i) => (
          <div key={i} className="game2048-tile"
            style={{ "--tile-bg": tileColor[v] ?? "#3c3a32", "--tile-color": v <= 4 ? "#776e65" : "#f9f6f2", "--tile-size": `${v >= 1024 ? 18 : v >= 128 ? 22 : 28}px` } as React.CSSProperties}>
            {v > 0 ? v : ""}
          </div>
        ))}
      </div>
      <div className="game2048-arrows">
        <button type="button" className="arrow-btn" onClick={() => move("up")}>↑</button>
        <div className="flex gap-2">
          <button type="button" className="arrow-btn" onClick={() => move("left")}>←</button>
          <button type="button" className="arrow-btn" onClick={() => move("down")}>↓</button>
          <button type="button" className="arrow-btn" onClick={() => move("right")}>→</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   TIC TAC TOE
════════════════════════════════════════ */
function GameTicTacToe() {
  const [cells, setCells] = useState<(string | null)[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);

  function checkWinner(b: (string | null)[]): string | null {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b2,c] of lines) {
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a]!;
    }
    return null;
  }

  const winner = checkWinner(cells);
  const draw   = !winner && cells.every(Boolean);

  function click(i: number) {
    if (cells[i] || winner) return;
    const next = [...cells]; next[i] = isX ? "X" : "O";
    setCells(next); setIsX(!isX);
  }

  return (
    <div className="ttt-wrap">
      <p className="ttt-status">
        {winner ? `🏆 ${winner} yutdi!` : draw ? "Durang!" : `Navbat: ${isX ? "X" : "O"}`}
      </p>
      <div className="ttt-grid">
        {cells.map((v, i) => (
          <button key={i} type="button"
            className={`ttt-cell${v === "X" ? " x" : v === "O" ? " o" : ""}`}
            onClick={() => click(i)}>{v}</button>
        ))}
      </div>
      <button type="button" className="miniapp-play-btn mt-4"
        onClick={() => { setCells(Array(9).fill(null)); setIsX(true); }}>
        Qayta o'ynash
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   MEMORY CARDS
════════════════════════════════════════ */
const EMOJIS = ["🎮","🐍","🐦","🧠","🃏","🎯","🎲","🏆"];

function GameMemory() {
  function newDeck() {
    return [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  }

  const [cards, setCards]     = useState(newDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves]     = useState(0);

  function flip(id: number) {
    if (selected.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    const newSel   = [...selected, id];
    setCards(newCards); setSelected(newSel);
    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSel.map((sid) => newCards.find((c) => c.id === sid)!);
      if (a.emoji === b.emoji) {
        setCards((prev) => prev.map((c) => newSel.includes(c.id) ? { ...c, matched: true } : c));
        setSelected([]);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => newSel.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
    }
  }

  const won = cards.every((c) => c.matched);

  return (
    <div className="memory-wrap">
      <div className="game2048-score-row">
        <span className="game2048-score">Harakatlar: {moves}</span>
        <button type="button" className="miniapp-play-btn"
          onClick={() => { setCards(newDeck()); setSelected([]); setMoves(0); }}>Qayta</button>
      </div>
      {won && <p className="game2048-won">🎉 {moves} harakatda yutdingiz!</p>}
      <div className="memory-grid">
        {cards.map((card) => (
          <button key={card.id} type="button"
            className={`memory-card${card.flipped || card.matched ? " open" : ""}`}
            onClick={() => flip(card.id)}>
            {card.flipped || card.matched ? card.emoji : "❓"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   QUIZ
════════════════════════════════════════ */
const QUESTIONS = [
  { q: "Quvna qaysi mamlakatta ishlab chiqilgan?",  opts: ["O'zbekiston","Rossiya","Turkiya","AQSh"],     ans: 0 },
  { q: "2048 o'yinida maksimal katak qiymati?",     opts: ["1024","2048","4096","8192"],                  ans: 1 },
  { q: "HTML nima degan ma'noni anglatadi?",         opts: ["HyperText Markup Language","High Tech Modern Language","HyperTech Markup Layout","Hech biri"], ans: 0 },
  { q: "Snake o'yinida nimadan qochish kerak?",      opts: ["Olma","Devor va o'z dumidan","Suv","Tosh"],   ans: 1 },
  { q: "Dasturlashda 'bug' nima?",                   opts: ["Hasharot","Xato","Yangi funksiya","Kod turi"],ans: 1 },
];

function GameQuiz() {
  const [idx, setIdx]       = useState(0);
  const [score, setScore]   = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone]     = useState(false);

  function answer(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    if (i === QUESTIONS[idx].ans) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= QUESTIONS.length) { setDone(true); }
      else { setIdx((n) => n + 1); setChosen(null); }
    }, 900);
  }

  if (done) return (
    <div className="quiz-done">
      <p className="text-4xl">🏆</p>
      <p className="quiz-done-score">{score}/{QUESTIONS.length} to'g'ri javob</p>
      <button type="button" className="miniapp-play-btn"
        onClick={() => { setIdx(0); setScore(0); setChosen(null); setDone(false); }}>
        Qayta o'ynash
      </button>
    </div>
  );

  const q = QUESTIONS[idx];
  return (
    <div className="quiz-wrap">
      <p className="quiz-progress">{idx + 1}/{QUESTIONS.length}</p>
      <p className="quiz-question">{q.q}</p>
      <div className="quiz-opts">
        {q.opts.map((opt, i) => {
          let cls = "quiz-opt";
          if (chosen !== null) {
            if (i === q.ans) cls += " correct";
            else if (i === chosen) cls += " wrong";
          }
          return <button key={i} type="button" className={cls} onClick={() => answer(i)}>{opt}</button>;
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SNAKE & FLAPPY (tez kunda)
════════════════════════════════════════ */
function GameSnake() {
  return (
    <div className="game-coming">
      <p className="text-5xl">🐍</p>
      <p className="game-coming-text">Snake o'yini tez kunda!</p>
      <p className="text-muted text-sm mt-1">Ishlab chiqilmoqda...</p>
    </div>
  );
}

function GameFlappy() {
  return (
    <div className="game-coming">
      <p className="text-5xl">🐦</p>
      <p className="game-coming-text">Flappy Bird tez kunda!</p>
      <p className="text-muted text-sm mt-1">Ishlab chiqilmoqda...</p>
    </div>
  );
}
