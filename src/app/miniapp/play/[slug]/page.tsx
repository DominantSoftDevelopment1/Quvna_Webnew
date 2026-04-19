"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

const GAMES: Record<string, Game> = {
  "2048": {
    name: "2048",
    icon: "🎮",
    color: "#1D3A34",
    description: "Raqamlarni birlashtir, 2048 ga yet!",
    component: Game2048,
  },
  snake: {
    name: "Snake",
    icon: "🐍",
    color: "#1A2E1A",
    description: "Klassik ilon o'yini",
    component: GameSnake,
  },
  tictactoe: {
    name: "Tic Tac Toe",
    icon: "❌",
    color: "#1C1C2E",
    description: "Do'sting bilan X-O o'yna",
    component: GameTicTacToe,
  },
  memory: {
    name: "Memory Cards",
    icon: "🃏",
    color: "#2E1A1A",
    description: "Juft kartalarni top",
    component: GameMemory,
  },
  flappy: {
    name: "Flappy Bird",
    icon: "🐦",
    color: "#1A2535",
    description: "Qushni uchir, to'siqlardan o't",
    component: GameFlappy,
  },
  quiz: {
    name: "Quiz Master",
    icon: "🧠",
    color: "#2A1A35",
    description: "Bilimingizni sinab ko'ring",
    component: GameQuiz,
  },
};

interface Game {
  name: string; icon: string; color: string;
  description: string; component: () => React.ReactElement;
}

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const game = GAMES[slug];

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted text-lg">O'yin topilmadi</p>
        <button type="button" className="miniapp-play-btn" onClick={() => router.push("/miniapp")}>
          Orqaga
        </button>
      </div>
    );
  }

  const GameComponent = game.component;

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="game-page-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <div
          className="game-page-icon"
          style={{ "--app-color": game.color } as React.CSSProperties}
        >
          <span className="game-page-emoji">{game.icon}</span>
        </div>
        <div>
          <h1 className="game-page-title">{game.name}</h1>
          <p className="game-page-desc">{game.description}</p>
        </div>
      </div>

      {/* Game */}
      <div className="game-page-body">
        <GameComponent />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   2048
════════════════════════════════════════ */
import { useState, useEffect, useCallback } from "react";

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

  function initBoard() {
    let b = empty();
    b = addRandom(b);
    b = addRandom(b);
    return b;
  }

  const [board, setBoard] = useState<number[][]>(initBoard);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  function slideRow(row: number[]): { row: number[]; pts: number } {
    const filtered = row.filter((v) => v);
    let pts = 0;
    const merged: number[] = [];
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const val = filtered[i] * 2;
        merged.push(val);
        pts += val;
        i += 2;
      } else {
        merged.push(filtered[i]);
        i++;
      }
    }
    while (merged.length < 4) merged.push(0);
    return { row: merged, pts };
  }

  const move = useCallback((dir: "left" | "right" | "up" | "down") => {
    setBoard((prev) => {
      let b = prev.map((r) => [...r]);
      let totalPts = 0;
      let moved = false;

      const rotateRight = (m: number[][]) =>
        m[0].map((_, i) => m.map((r) => r[i]).reverse());
      const rotateLeft = (m: number[][]) =>
        m[0].map((_, i) => m.map((r) => r[r.length - 1 - i]));

      if (dir === "right") b = rotateRight(rotateRight(b));
      if (dir === "up") b = rotateLeft(b);
      if (dir === "down") b = rotateRight(b);

      b = b.map((row) => {
        const { row: newRow, pts } = slideRow(row);
        if (newRow.join() !== row.join()) moved = true;
        totalPts += pts;
        return newRow;
      });

      if (dir === "right") b = rotateRight(rotateRight(b));
      if (dir === "up") b = rotateRight(b);
      if (dir === "down") b = rotateLeft(b);

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
    0:"transparent", 2:"#eee4da", 4:"#ede0c8", 8:"#f2b179",
    16:"#f59563", 32:"#f67c5f", 64:"#f65e3b", 128:"#edcf72",
    256:"#edcc61", 512:"#edc850", 1024:"#edc53f", 2048:"#03FF93",
  };

  return (
    <div className="game2048-wrap">
      <div className="game2048-score-row">
        <span className="game2048-score">Ball: {score}</span>
        <button type="button" className="miniapp-play-btn" onClick={() => { setBoard(initBoard()); setScore(0); setWon(false); }}>
          Qayta
        </button>
      </div>
      {won && <p className="game2048-won">🎉 2048 ga yetdingiz!</p>}
      <div className="game2048-grid">
        {board.flat().map((v, i) => (
          <div
            key={i}
            className="game2048-tile"
            style={{
              "--tile-bg": tileColor[v] ?? "#3c3a32",
              "--tile-color": v <= 4 ? "#776e65" : "#f9f6f2",
              "--tile-size": `${v >= 1024 ? 18 : v >= 128 ? 22 : 28}px`,
            } as React.CSSProperties}
          >
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
  const draw = !winner && cells.every(Boolean);

  function click(i: number) {
    if (cells[i] || winner) return;
    const next = [...cells];
    next[i] = isX ? "X" : "O";
    setCells(next);
    setIsX(!isX);
  }

  return (
    <div className="ttt-wrap">
      <p className="ttt-status">
        {winner ? `🏆 ${winner} yutdi!` : draw ? "Durang!" : `Navbat: ${isX ? "X" : "O"}`}
      </p>
      <div className="ttt-grid">
        {cells.map((v, i) => (
          <button key={i} type="button" className={`ttt-cell${v === "X" ? " x" : v === "O" ? " o" : ""}`} onClick={() => click(i)}>
            {v}
          </button>
        ))}
      </div>
      <button type="button" className="miniapp-play-btn mt-4" onClick={() => { setCells(Array(9).fill(null)); setIsX(true); }}>
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

  const [cards, setCards] = useState(newDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  function flip(id: number) {
    if (selected.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    const newSel = [...selected, id];
    setCards(newCards);
    setSelected(newSel);

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
        <button type="button" className="miniapp-play-btn" onClick={() => { setCards(newDeck()); setSelected([]); setMoves(0); }}>Qayta</button>
      </div>
      {won && <p className="game2048-won">🎉 {moves} harakatda yutdingiz!</p>}
      <div className="memory-grid">
        {cards.map((card) => (
          <button key={card.id} type="button" className={`memory-card${card.flipped || card.matched ? " open" : ""}`} onClick={() => flip(card.id)}>
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
  { q: "Quvna qaysi mamlakatta ishlab chiqilgan?", opts: ["O'zbekiston","Rossiya","Turkiya","AQSh"], ans: 0 },
  { q: "2048 o'yinida maksimal katak qiymati?", opts: ["1024","2048","4096","8192"], ans: 1 },
  { q: "HTML nima degan ma'noni anglatadi?", opts: ["HyperText Markup Language","High Tech Modern Language","HyperTech Markup Layout","Hech biri"], ans: 0 },
  { q: "Snake o'yinida nimadan qochish kerak?", opts: ["Olma","Devor va o'z dumidan","Suv","Tosh"], ans: 1 },
  { q: "Dasturlashda 'bug' nima?", opts: ["Hasharot","Xato","Yangi funksiya","Kod turi"], ans: 1 },
];

function GameQuiz() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(false);

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
      <button type="button" className="miniapp-play-btn" onClick={() => { setIdx(0); setScore(0); setChosen(null); setDone(false); }}>
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
          return (
            <button key={i} type="button" className={cls} onClick={() => answer(i)}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SNAKE (sodda)
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

/* ════════════════════════════════════════
   FLAPPY (sodda)
════════════════════════════════════════ */
function GameFlappy() {
  return (
    <div className="game-coming">
      <p className="text-5xl">🐦</p>
      <p className="game-coming-text">Flappy Bird tez kunda!</p>
      <p className="text-muted text-sm mt-1">Ishlab chiqilmoqda...</p>
    </div>
  );
}
