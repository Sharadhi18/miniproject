import { Cell } from './types';
import { COLORS, GHOST_COLORS } from './constants';
import { TetrominoType } from './types';

interface Props {
  cell: Cell | string;
}

export function BoardCell({ cell }: Props) {
  if (!cell) {
    return (
      <div className="w-full h-full border border-white/5 bg-slate-900/60" />
    );
  }

  const isGhost = typeof cell === 'string' && cell.startsWith('ghost-');
  const type = isGhost ? (cell.replace('ghost-', '') as TetrominoType) : (cell as TetrominoType);
  const color = isGhost ? GHOST_COLORS[type] : COLORS[type];
  const solidColor = COLORS[type];

  if (isGhost) {
    return (
      <div
        className="w-full h-full border"
        style={{
          backgroundColor: color,
          borderColor: solidColor,
          borderWidth: '1px',
        }}
      />
    );
  }

  return (
    <div
      className="w-full h-full relative"
      style={{ backgroundColor: color }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 50%)`,
        }}
      />
      <div
        className="absolute inset-0 border-t border-l"
        style={{ borderColor: 'rgba(255,255,255,0.4)' }}
      />
      <div
        className="absolute inset-0 border-b border-r"
        style={{ borderColor: 'rgba(0,0,0,0.3)' }}
      />
    </div>
  );
}
