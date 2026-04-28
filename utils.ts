import { useCallback, useEffect, useRef, useState } from 'react';
import { Board, GameStatus, Tetromino } from './types';
import {
  BOARD_WIDTH,
  LEVEL_SPEED,
  LINES_PER_LEVEL,
  SCORE_TABLE,
} from './constants';
import {
  calcLevel,
  calcScore,
  clearLines,
  createEmptyBoard,
  getGhostPosition,
  isValidPosition,
  placePiece,
  randomTetromino,
  rotate,
} from './utils';

interface TetrisState {
  board: Board;
  current: Tetromino | null;
  next: Tetromino | null;
  ghostY: number;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
  highScore: number;
}

export function useTetris() {
  const [state, setState] = useState<TetrisState>(() => ({
    board: createEmptyBoard(),
    current: null,
    next: null,
    ghostY: 0,
    score: 0,
    lines: 0,
    level: 1,
    status: 'idle',
    highScore: parseInt(localStorage.getItem('tetris-high-score') ?? '0', 10),
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  const dropInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnPiece = useCallback((board: Board, nextPiece: Tetromino) => {
    const next = randomTetromino();
    const ghost = getGhostPosition(board, nextPiece);
    if (!isValidPosition(board, nextPiece)) {
      const highScore = Math.max(stateRef.current.score, stateRef.current.highScore);
      localStorage.setItem('tetris-high-score', String(highScore));
      setState(s => ({ ...s, current: nextPiece, next, ghostY: ghost.y, status: 'gameover', highScore }));
      return;
    }
    setState(s => ({ ...s, board, current: nextPiece, next, ghostY: ghost.y }));
  }, []);

  const lockPiece = useCallback((board: Board, piece: Tetromino) => {
    const placed = placePiece(board, piece);
    const { board: cleared, linesCleared } = clearLines(placed);
    const s = stateRef.current;
    const newLines = s.lines + linesCleared;
    const newLevel = calcLevel(newLines);
    const newScore = s.score + calcScore(linesCleared, newLevel, SCORE_TABLE);
    setState(prev => ({ ...prev, board: cleared, score: newScore, lines: newLines, level: newLevel }));
    spawnPiece(cleared, randomTetromino());
  }, [spawnPiece]);

  const moveDown = useCallback(() => {
    const { current, board, status } = stateRef.current;
    if (!current || status !== 'playing') return;
    if (isValidPosition(board, current, { x: 0, y: 1 })) {
      const moved = { ...current, position: { ...current.position, y: current.position.y + 1 } };
      setState(s => ({ ...s, current: moved }));
    } else {
      lockPiece(board, current);
    }
  }, [lockPiece]);

  const startDrop = useCallback((level: number) => {
    if (dropInterval.current) clearInterval(dropInterval.current);
    const speed = LEVEL_SPEED[level] ?? 70;
    dropInterval.current = setInterval(moveDown, speed);
  }, [moveDown]);

  const stopDrop = useCallback(() => {
    if (dropInterval.current) {
      clearInterval(dropInterval.current);
      dropInterval.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.status === 'playing') {
      startDrop(state.level);
    } else {
      stopDrop();
    }
    return stopDrop;
  }, [state.status, state.level, startDrop, stopDrop]);

  const startGame = useCallback(() => {
    const board = createEmptyBoard();
    const first = randomTetromino();
    const next = randomTetromino();
    const ghost = getGhostPosition(board, first);
    setState(s => ({
      board,
      current: first,
      next,
      ghostY: ghost.y,
      score: 0,
      lines: 0,
      level: 1,
      status: 'playing',
      highScore: s.highScore,
    }));
  }, []);

  const togglePause = useCallback(() => {
    setState(s => {
      if (s.status === 'playing') return { ...s, status: 'paused' };
      if (s.status === 'paused') return { ...s, status: 'playing' };
      return s;
    });
  }, []);

  const moveLeft = useCallback(() => {
    const { current, board, status } = stateRef.current;
    if (!current || status !== 'playing') return;
    if (isValidPosition(board, current, { x: -1, y: 0 })) {
      const moved = { ...current, position: { ...current.position, x: current.position.x - 1 } };
      const ghostY = getGhostPosition(board, moved).y;
      setState(s => ({ ...s, current: moved, ghostY }));
    }
  }, []);

  const moveRight = useCallback(() => {
    const { current, board, status } = stateRef.current;
    if (!current || status !== 'playing') return;
    if (isValidPosition(board, current, { x: 1, y: 0 })) {
      const moved = { ...current, position: { ...current.position, x: current.position.x + 1 } };
      const ghostY = getGhostPosition(board, moved).y;
      setState(s => ({ ...s, current: moved, ghostY }));
    }
  }, []);

  const rotatePiece = useCallback(() => {
    const { current, board, status } = stateRef.current;
    if (!current || status !== 'playing') return;
    const rotated = { ...current, shape: rotate(current.shape) };
    const kicks = [0, 1, -1, 2, -2];
    for (const kick of kicks) {
      const kicked = { ...rotated, position: { ...rotated.position, x: rotated.position.x + kick } };
      if (isValidPosition(board, kicked)) {
        const ghostY = getGhostPosition(board, kicked).y;
        setState(s => ({ ...s, current: kicked, ghostY }));
        return;
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    const { current, board, status, ghostY } = stateRef.current;
    if (!current || status !== 'playing') return;
    const dropped = { ...current, position: { x: current.position.x, y: ghostY } };
    lockPiece(board, dropped);
  }, [lockPiece]);

  const softDrop = useCallback(() => {
    moveDown();
  }, [moveDown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowDown': e.preventDefault(); softDrop(); break;
        case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'p':
        case 'P': togglePause(); break;
        case 'Enter':
          if (stateRef.current.status === 'idle' || stateRef.current.status === 'gameover') startGame();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveLeft, moveRight, softDrop, rotatePiece, hardDrop, togglePause, startGame]);

  const renderBoard = useCallback((): Board => {
    const { board, current, ghostY } = stateRef.current;
    if (!current) return board;
    const display = board.map(row => [...row]) as Board;
    // ghost
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (!current.shape[r][c]) continue;
        const x = current.position.x + c;
        const y = ghostY + r;
        if (y >= 0 && y < 20 && x >= 0 && x < BOARD_WIDTH && display[y][x] === null) {
          display[y][x] = `ghost-${current.type}` as never;
        }
      }
    }
    // active piece
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (!current.shape[r][c]) continue;
        const x = current.position.x + c;
        const y = current.position.y + r;
        if (y >= 0 && y < 20 && x >= 0 && x < BOARD_WIDTH) {
          display[y][x] = current.type;
        }
      }
    }
    return display;
  }, []);

  return {
    ...state,
    renderBoard,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    rotatePiece,
    hardDrop,
    softDrop,
  };
}
