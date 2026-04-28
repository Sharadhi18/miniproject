import { Board, Cell, Tetromino, TetrominoType, Position } from './types';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES, TETROMINO_TYPES } from './constants';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

export function randomTetromino(): Tetromino {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)] as TetrominoType;
  const shape = TETROMINOES[type].map(row => [...row]);
  return {
    type,
    shape,
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
      y: 0,
    },
  };
}

export function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
}

export function isValidPosition(board: Board, piece: Tetromino, offset: Position = { x: 0, y: 0 }): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const newX = piece.position.x + c + offset.x;
      const newY = piece.position.y + r + offset.y;
      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
      if (newY < 0) continue;
      if (board[newY][newX] !== null) return false;
    }
  }
  return true;
}

export function placePiece(board: Board, piece: Tetromino): Board {
  const newBoard = board.map(row => [...row]) as Board;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const x = piece.position.x + c;
      const y = piece.position.y + r;
      if (y >= 0) newBoard[y][x] = piece.type as Cell;
    }
  }
  return newBoard;
}

export function clearLines(board: Board): { board: Board; linesCleared: number } {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  const emptyRows: Cell[][] = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(null));
  return { board: [...emptyRows, ...newBoard], linesCleared };
}

export function getGhostPosition(board: Board, piece: Tetromino): Position {
  let ghostY = piece.position.y;
  while (isValidPosition(board, piece, { x: 0, y: ghostY - piece.position.y + 1 })) {
    ghostY++;
  }
  return { x: piece.position.x, y: ghostY };
}

export function calcLevel(lines: number): number {
  return Math.min(10, Math.floor(lines / 10) + 1);
}

export function calcScore(linesCleared: number, level: number, scoreTable: Record<number, number>): number {
  return (scoreTable[linesCleared] ?? 0) * level;
}
