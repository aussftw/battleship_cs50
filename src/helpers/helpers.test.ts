import { initializeBoard, allShipsSunk, placeShip } from './';

import { Board, PlacedShip } from '@/types';
import { SHIP_SIZES } from '@/constants';

describe('Board Utilities', () => {
  let board: Board;

  beforeEach(() => {
    board = initializeBoard();
  });

  test('initializeBoard should create a 10x10 board', () => {
    expect(board.length).toBe(10);
    board.forEach((row) => {
      expect(row.length).toBe(10);
      expect(row.every((cell) => cell === 'EMPTY')).toBe(true);
    });
  });

  test('allShipsSunk should return true if all ships are sunk', () => {
    expect(allShipsSunk(board)).toBe(true);
  });

  test('allShipsSunk should return false if any ship is not sunk', () => {
    board[0][0] = 'SHIP';
    expect(allShipsSunk(board)).toBe(false);
  });

  test('SHIP_SIZES should match the expected ship sizes', () => {
    expect(SHIP_SIZES['Destroyer']).toBe(1);
    expect(SHIP_SIZES['Submarine']).toBe(2);
    expect(SHIP_SIZES['Cruiser']).toBe(3);
    expect(SHIP_SIZES['Battleship']).toBe(4);
    expect(SHIP_SIZES['Carrier']).toBe(5);
  });
});

describe('Ship Placement - placeShip function', () => {
  let board: Board;

  beforeEach(() => {
    board = initializeBoard();
  });

  describe('Horizontal Ship Placement', () => {
    it('should place a horizontal destroyer (size 1) on empty board', () => {
      const ship: PlacedShip = {
        x: 0,
        y: 0,
        length: 1,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 0, 0, ship);

      expect(newBoard[0][0]).toBe('SHIP');
      expect(newBoard).not.toBe(board);
    });

    it('should place a horizontal submarine (size 2) on empty board', () => {
      const ship: PlacedShip = {
        x: 2,
        y: 3,
        length: 2,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 2, 3, ship);

      expect(newBoard[2][3]).toBe('SHIP');
      expect(newBoard[2][4]).toBe('SHIP');
      expect(newBoard[2][2]).toBe('EMPTY');
      expect(newBoard[2][5]).toBe('EMPTY');
    });

    it('should place a horizontal battleship (size 4) on empty board', () => {
      const ship: PlacedShip = {
        x: 5,
        y: 1,
        length: 4,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 5, 1, ship);

      expect(newBoard[5][1]).toBe('SHIP');
      expect(newBoard[5][2]).toBe('SHIP');
      expect(newBoard[5][3]).toBe('SHIP');
      expect(newBoard[5][4]).toBe('SHIP');
    });

    it('should not place horizontal ship that goes off board (right edge)', () => {
      const ship: PlacedShip = {
        x: 0,
        y: 8,
        length: 3,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 0, 8, ship);

      expect(newBoard).toEqual(board);
      expect(newBoard[0][8]).toBe('EMPTY');
      expect(newBoard[0][9]).toBe('EMPTY');
    });

    it('should not place horizontal ship on occupied cells', () => {
      board[1][1] = 'SHIP';

      const ship: PlacedShip = {
        x: 1,
        y: 0,
        length: 3,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 1, 0, ship);

      expect(newBoard).toEqual(board);
      expect(newBoard[1][0]).toBe('EMPTY');
      expect(newBoard[1][2]).toBe('EMPTY');
    });
  });

  describe('Vertical Ship Placement', () => {
    it('should place a vertical destroyer (size 1) on empty board', () => {
      const ship: PlacedShip = { x: 3, y: 3, length: 1, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 3, 3, ship);

      expect(newBoard[3][3]).toBe('SHIP');
    });

    it('should place a vertical cruiser (size 3) on empty board', () => {
      const ship: PlacedShip = { x: 1, y: 5, length: 3, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 1, 5, ship);

      expect(newBoard[1][5]).toBe('SHIP');
      expect(newBoard[2][5]).toBe('SHIP');
      expect(newBoard[3][5]).toBe('SHIP');
      expect(newBoard[0][5]).toBe('EMPTY');
      expect(newBoard[4][5]).toBe('EMPTY');
    });

    it('should place a vertical carrier (size 5) on empty board', () => {
      const ship: PlacedShip = { x: 2, y: 7, length: 5, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 2, 7, ship);

      expect(newBoard[2][7]).toBe('SHIP');
      expect(newBoard[3][7]).toBe('SHIP');
      expect(newBoard[4][7]).toBe('SHIP');
      expect(newBoard[5][7]).toBe('SHIP');
      expect(newBoard[6][7]).toBe('SHIP');
    });

    it('should not place vertical ship that goes off board (bottom edge)', () => {
      const ship: PlacedShip = { x: 8, y: 2, length: 3, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 8, 2, ship);

      expect(newBoard).toEqual(board);
      expect(newBoard[8][2]).toBe('EMPTY');
      expect(newBoard[9][2]).toBe('EMPTY');
    });

    it('should not place vertical ship on occupied cells', () => {
      board[3][4] = 'SHIP';

      const ship: PlacedShip = { x: 2, y: 4, length: 3, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 2, 4, ship);

      expect(newBoard).toEqual(board);
      expect(newBoard[2][4]).toBe('EMPTY');
      expect(newBoard[4][4]).toBe('EMPTY');
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    it('should place ship at board edge (top-left corner)', () => {
      const ship: PlacedShip = {
        x: 0,
        y: 0,
        length: 1,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 0, 0, ship);

      expect(newBoard[0][0]).toBe('SHIP');
    });

    it('should place ship at board edge (bottom-right corner)', () => {
      const ship: PlacedShip = {
        x: 9,
        y: 9,
        length: 1,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 9, 9, ship);

      expect(newBoard[9][9]).toBe('SHIP');
    });

    it('should place horizontal ship at right edge (exact fit)', () => {
      const ship: PlacedShip = {
        x: 5,
        y: 9,
        length: 1,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 5, 9, ship);

      expect(newBoard[5][9]).toBe('SHIP');
    });

    it('should place vertical ship at bottom edge (exact fit)', () => {
      const ship: PlacedShip = { x: 9, y: 3, length: 1, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 9, 3, ship);

      expect(newBoard[9][3]).toBe('SHIP');
    });

    it('should not place zero-length ship', () => {
      const ship: PlacedShip = {
        x: 5,
        y: 5,
        length: 0,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 5, 5, ship);

      expect(newBoard).toEqual(board);
    });

    it('should handle out-of-bounds placement attempts', () => {
      const ship1: PlacedShip = {
        x: 0,
        y: 9,
        length: 2,
        direction: 'HORIZONTAL',
      };
      const newBoard1 = placeShip(board, 0, 9, ship1);
      expect(newBoard1).toEqual(board);

      const ship2: PlacedShip = {
        x: 9,
        y: 0,
        length: 2,
        direction: 'VERTICAL',
      };
      const newBoard2 = placeShip(board, 9, 0, ship2);
      expect(newBoard2).toEqual(board);
    });

    it('should handle boundary conditions correctly', () => {
      const ship1: PlacedShip = {
        x: 0,
        y: 8,
        length: 2,
        direction: 'HORIZONTAL',
      };
      const newBoard1 = placeShip(board, 0, 8, ship1);
      expect(newBoard1[0][8]).toBe('SHIP');
      expect(newBoard1[0][9]).toBe('SHIP');

      const ship2: PlacedShip = {
        x: 8,
        y: 0,
        length: 2,
        direction: 'VERTICAL',
      };
      const newBoard2 = placeShip(board, 8, 0, ship2);
      expect(newBoard2[8][0]).toBe('SHIP');
      expect(newBoard2[9][0]).toBe('SHIP');
    });
  });

  describe('Board Immutability', () => {
    it('should not mutate the original board', () => {
      const originalBoard = initializeBoard();
      const boardCopy = originalBoard.map((row) => [...row]);

      const ship: PlacedShip = {
        x: 2,
        y: 2,
        length: 3,
        direction: 'HORIZONTAL',
      };
      placeShip(originalBoard, 2, 2, ship);

      expect(originalBoard).toEqual(boardCopy);
    });

    it('should return a deep copy of the board', () => {
      const ship: PlacedShip = { x: 1, y: 1, length: 2, direction: 'VERTICAL' };
      const newBoard = placeShip(board, 1, 1, ship);

      newBoard[0][0] = 'HIT';
      expect(board[0][0]).toBe('EMPTY');
    });

    it('should create independent board instances for multiple placements', () => {
      const ship1: PlacedShip = {
        x: 0,
        y: 0,
        length: 1,
        direction: 'HORIZONTAL',
      };
      const ship2: PlacedShip = {
        x: 2,
        y: 2,
        length: 1,
        direction: 'HORIZONTAL',
      };

      const board1 = placeShip(board, 0, 0, ship1);
      const board2 = placeShip(board, 2, 2, ship2);

      expect(board1[0][0]).toBe('SHIP');
      expect(board1[2][2]).toBe('EMPTY');
      expect(board2[0][0]).toBe('EMPTY');
      expect(board2[2][2]).toBe('SHIP');
    });
  });

  describe('Multiple Ship Placement Scenarios', () => {
    it('should place multiple ships without conflicts', () => {
      const ship1: PlacedShip = {
        x: 0,
        y: 0,
        length: 2,
        direction: 'HORIZONTAL',
      };
      const ship2: PlacedShip = {
        x: 3,
        y: 3,
        length: 3,
        direction: 'VERTICAL',
      };

      let newBoard = placeShip(board, 0, 0, ship1);
      newBoard = placeShip(newBoard, 3, 3, ship2);

      expect(newBoard[0][0]).toBe('SHIP');
      expect(newBoard[0][1]).toBe('SHIP');

      expect(newBoard[3][3]).toBe('SHIP');
      expect(newBoard[4][3]).toBe('SHIP');
      expect(newBoard[5][3]).toBe('SHIP');

      expect(newBoard[1][1]).toBe('EMPTY');
    });

    it('should prevent overlapping ship placement', () => {
      const ship1: PlacedShip = {
        x: 2,
        y: 2,
        length: 3,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 2, 2, ship1);

      const ship2: PlacedShip = {
        x: 1,
        y: 3,
        length: 3,
        direction: 'VERTICAL',
      };
      const finalBoard = placeShip(newBoard, 1, 3, ship2);

      expect(finalBoard).toEqual(newBoard);
      expect(finalBoard[1][3]).toBe('EMPTY');
    });

    it('should place adjacent ships without conflicts', () => {
      const ship1: PlacedShip = {
        x: 2,
        y: 2,
        length: 2,
        direction: 'HORIZONTAL',
      };
      const ship2: PlacedShip = {
        x: 2,
        y: 5,
        length: 2,
        direction: 'HORIZONTAL',
      };

      let newBoard = placeShip(board, 2, 2, ship1);
      newBoard = placeShip(newBoard, 2, 5, ship2);

      expect(newBoard[2][2]).toBe('SHIP');
      expect(newBoard[2][3]).toBe('SHIP');
      expect(newBoard[2][4]).toBe('EMPTY');
      expect(newBoard[2][5]).toBe('SHIP');
      expect(newBoard[2][6]).toBe('SHIP');
    });
  });

  describe('Integration with Game Logic', () => {
    it('should work with all standard ship sizes', () => {
      const destroyer: PlacedShip = {
        x: 0,
        y: 0,
        length: SHIP_SIZES.Destroyer,
        direction: 'HORIZONTAL',
      };
      const submarine: PlacedShip = {
        x: 1,
        y: 0,
        length: SHIP_SIZES.Submarine,
        direction: 'HORIZONTAL',
      };
      const cruiser: PlacedShip = {
        x: 2,
        y: 0,
        length: SHIP_SIZES.Cruiser,
        direction: 'HORIZONTAL',
      };
      const battleship: PlacedShip = {
        x: 3,
        y: 0,
        length: SHIP_SIZES.Battleship,
        direction: 'HORIZONTAL',
      };
      const carrier: PlacedShip = {
        x: 4,
        y: 0,
        length: SHIP_SIZES.Carrier,
        direction: 'HORIZONTAL',
      };

      let newBoard = board;
      newBoard = placeShip(newBoard, 0, 0, destroyer);
      newBoard = placeShip(newBoard, 1, 0, submarine);
      newBoard = placeShip(newBoard, 2, 0, cruiser);
      newBoard = placeShip(newBoard, 3, 0, battleship);
      newBoard = placeShip(newBoard, 4, 0, carrier);

      expect(newBoard[0][0]).toBe('SHIP'); // Destroyer
      expect(newBoard[1][0]).toBe('SHIP'); // Submarine start
      expect(newBoard[1][1]).toBe('SHIP'); // Submarine end
      expect(newBoard[2][2]).toBe('SHIP'); // Cruiser middle
      expect(newBoard[3][3]).toBe('SHIP'); // Battleship middle
      expect(newBoard[4][4]).toBe('SHIP'); // Carrier end
    });

    it('should maintain board consistency after ship placement', () => {
      const ship: PlacedShip = {
        x: 3,
        y: 3,
        length: 3,
        direction: 'HORIZONTAL',
      };
      const newBoard = placeShip(board, 3, 3, ship);

      let shipCells = 0;
      let emptyCells = 0;

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (newBoard[i][j] === 'SHIP') shipCells++;
          if (newBoard[i][j] === 'EMPTY') emptyCells++;
        }
      }

      expect(shipCells).toBe(3); // Ship length
      expect(emptyCells).toBe(97); // 100 - 3
      expect(shipCells + emptyCells).toBe(100); // Total board size
    });
  });
});
