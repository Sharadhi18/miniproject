import { useCallback, useEffect, useRef } from 'react';
import { useTetris } from './tetris/useTetris';
import { BoardCell } from './tetris/BoardCell';
import { NextPiece } from './tetris/NextPiece';
import { BOARD_WIDTH, BOARD_HEIGHT } from './tetris/constants';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Pause,
  ArrowDownToLine,
} from 'lucide-react';

const CELL_SIZE = 30;

export default function App() {
  const {
    next,
    score,
    lines,
    level,
    status,
    highScore,
    renderBoard,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    rotatePiece,
    hardDrop,
    softDrop,
  } = useTetris();

  const displayBoard = renderBoard();

  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = useCallback((action: () => void) => {
    action();
    holdRef.current = setInterval(action, 80);
  }, []);

  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  useEffect(() => () => stopHold(), [stopHold]);

  return (
    <div
      className="min-h-screen flex items-center justify-center select-none"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex items-start gap-6">
        {/* Left panel */}
        <div className="flex flex-col gap-4 w-28">
          <StatCard label="Score" value={score.toLocaleString()} />
          <StatCard label="Best" value={highScore.toLocaleString()} accent />
          <StatCard label="Level" value={String(level)} />
          <StatCard label="Lines" value={String(lines)} />
        </div>

        {/* Board */}
        <div className="relative">
          <div
            className="relative border border-white/15 rounded-xl overflow-hidden"
            style={{
              width: BOARD_WIDTH * CELL_SIZE,
              height: BOARD_HEIGHT * CELL_SIZE,
              boxShadow: '0 0 40px rgba(6,182,212,0.1), 0 20px 60px rgba(0,0,0,0.5)',
              background: 'rgba(15,23,42,0.95)',
            }}
          >
            {/* grid lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
              }}
            />

            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
              }}
            >
              {displayBoard.map((row, r) =>
                row.map((cell, c) => (
                  <BoardCell key={`${r}-${c}`} cell={cell} />
                ))
              )}
            </div>

            {(status === 'idle' || status === 'gameover') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-slate-900/70">
                {status === 'gameover' && (
                  <div className="text-center mb-5">
                    <p className="text-red-400 text-2xl font-black tracking-widest uppercase">Game Over</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Score: <span className="text-white font-bold">{score.toLocaleString()}</span>
                    </p>
                    {score > 0 && score >= highScore && (
                      <p className="text-cyan-400 text-xs font-semibold mt-1">New High Score!</p>
                    )}
                  </div>
                )}
                {status === 'idle' && (
                  <div className="text-center mb-6">
                    <p
                      className="text-4xl font-black text-white"
                      style={{ letterSpacing: '0.25em', textShadow: '0 0 30px rgba(6,182,212,0.5)' }}
                    >
                      TETRIS
                    </p>
                    <p className="text-slate-400 text-sm mt-2">Classic block puzzle</p>
                  </div>
                )}
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 active:scale-95 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(6,182,212,0.4)',
                  }}
                >
                  <Play size={15} />
                  {status === 'gameover' ? 'Play Again' : 'Start Game'}
                </button>
                <p className="text-slate-500 text-xs mt-3">Press Enter to start</p>
              </div>
            )}

            {status === 'paused' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-slate-900/60">
                <Pause size={36} className="text-cyan-400 mb-3" />
                <p className="text-white text-xl font-bold tracking-widest uppercase">Paused</p>
                <button
                  onClick={togglePause}
                  className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white border border-cyan-400/40 hover:bg-cyan-400/10 transition-colors"
                >
                  Resume
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 w-28">
          <NextPiece piece={next} />

          <div className="bg-slate-800/60 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">Keys</p>
            <div className="text-xs text-slate-500 space-y-1.5">
              <KeyHint label="Move" key_="← →" />
              <KeyHint label="Rotate" key_="↑" />
              <KeyHint label="Soft" key_="↓" />
              <KeyHint label="Hard" key_="Space" />
              <KeyHint label="Pause" key_="P" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {status === 'playing' && (
              <ActionBtn onClick={togglePause} icon={<Pause size={12} />} label="Pause" />
            )}
            {status === 'paused' && (
              <ActionBtn onClick={togglePause} icon={<Play size={12} />} label="Resume" accent />
            )}
            {(status === 'playing' || status === 'paused') && (
              <ActionBtn onClick={startGame} icon={<RotateCcw size={12} />} label="Restart" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden pb-safe">
        <div className="flex justify-center gap-3 p-4 bg-slate-900/95 border-t border-white/10">
          <MobileBtn onPress={() => startHold(moveLeft)} onRelease={stopHold}>
            <ChevronLeft size={22} />
          </MobileBtn>
          <MobileBtn onPress={rotatePiece}>
            <ChevronUp size={22} />
          </MobileBtn>
          <MobileBtn onPress={() => startHold(softDrop)} onRelease={stopHold}>
            <ChevronDown size={22} />
          </MobileBtn>
          <MobileBtn onPress={() => startHold(moveRight)} onRelease={stopHold}>
            <ChevronRight size={22} />
          </MobileBtn>
          <MobileBtn onPress={hardDrop} highlight>
            <ArrowDownToLine size={22} />
          </MobileBtn>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
      <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-0.5">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${accent ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function KeyHint({ label, key_ }: { label: string; key_: string }) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <span className="text-slate-300 font-mono text-xs">{key_}</span>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon,
  label,
  accent = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-colors border ${
        accent
          ? 'text-cyan-300 border-cyan-400/30 hover:bg-cyan-400/10'
          : 'text-slate-400 border-white/10 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileBtn({
  children,
  onPress,
  onRelease,
  highlight = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  onRelease?: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onTouchStart={e => { e.preventDefault(); onPress(); }}
      onTouchEnd={e => { e.preventDefault(); onRelease?.(); }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"
      style={{
        background: highlight ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {children}
    </button>
  );
}
