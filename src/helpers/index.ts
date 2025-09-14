import { Board, PlacedShip } from '@/types';
import { BOARD_SIZE } from '@/constants';

function canPlaceShip(
  board: Board,
  x: number,
  y: number,
  ship: PlacedShip,
): boolean {
  if (ship.direction === 'HORIZONTAL') {
    for (let i = 0; i < ship.length; i++) {
      if (y + i >= board[x].length || board[x][y + i] !== 'EMPTY') {
        return false;
      }
    }
  } else {
    for (let i = 0; i < ship.length; i++) {
      if (x + i >= board.length || board[x + i][y] !== 'EMPTY') {
        return false;
      }
    }
  }
  return true;
}

export function placeShip(
  board: Board,
  x: number,
  y: number,
  ship: PlacedShip,
): Board {
  if (!canPlaceShip(board, x, y, ship)) {
    return board;
  }

  const newBoard = [...board].map((row) => [...row]);

  if (ship.direction === 'HORIZONTAL') {
    for (let i = 0; i < ship.length; i++) {
      newBoard[x][y + i] = 'SHIP';
    }
  } else {
    for (let i = 0; i < ship.length; i++) {
      newBoard[x + i][y] = 'SHIP';
    }
  }

  return newBoard;
}

export function initializeBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill('EMPTY'),
  );
}

export const allShipsSunk = (board: Board): boolean => {
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'SHIP') {
        return false;
      }
    }
  }
  return true;
};
