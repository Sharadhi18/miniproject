import { Tetromino } from './types';
import { COLORS } from './constants';

interface Props {
  piece: Tetromino | null;
}

export function NextPiece({ piece }: Props) {
  const gridSize = 4;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Next</span>
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-3 flex items-center justify-center" style={{ width: 88, height: 80 }}>
        {piece && (
          <div className="flex flex-col gap-px">
            {Array.from({ length: gridSize }).map((_, r) => (
              <div key={r} className="flex gap-px">
                {Array.from({ length: gridSize }).map((_, c) => {
                  const offsetR = Math.floor((gridSize - piece.shape.length) / 2);
                  const offsetC = Math.floor((gridSize - piece.shape[0].length) / 2);
                  const pr = r - offsetR;
                  const pc = c - offsetC;
                  const filled = pr >= 0 && pr < piece.shape.length && pc >= 0 && pc < piece.shape[0].length && piece.shape[pr][pc];
                  return (
                    <div
                      key={c}
                      className="rounded-sm"
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: filled ? COLORS[piece.type] : 'transparent',
                        boxShadow: filled ? `inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.25)` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
