import { TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

export const COLORS: Record<TetrominoType, string> = {
  I: '#06b6d4',
  O: '#eab308',
  T: '#ec4899',
  S: '#22c55e',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
};

export const GHOST_COLORS: Record<TetrominoType, string> = {
  I: 'rgba(6,182,212,0.25)',
  O: 'rgba(234,179,8,0.25)',
  T: 'rgba(236,72,153,0.25)',
  S: 'rgba(34,197,94,0.25)',
  Z: 'rgba(239,68,68,0.25)',
  J: 'rgba(59,130,246,0.25)',
  L: 'rgba(249,115,22,0.25)',
};

export const LEVEL_SPEED: Record<number, number> = {
  1: 800,
  2: 650,
  3: 530,
  4: 430,
  5: 340,
  6: 260,
  7: 190,
  8: 140,
  9: 100,
  10: 70,
};

export const LINES_PER_LEVEL = 10;

export const SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
