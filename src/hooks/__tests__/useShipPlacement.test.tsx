import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useShipPlacement } from '../useShipPlacement';
import { initializeBoard } from '@/helpers';
import gameReducer from '@/features/gameReducer';
import selectShipReducer from '@/features/selectShipReducer';
import { CellStatus } from '@/types';

jest.mock('@/helpers', () => ({
  ...jest.requireActual('@/helpers'),
  placeShip: jest.fn(),
}));

describe('useShipPlacement', () => {
  let store: ReturnType<typeof configureStore>;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
        selectShip: selectShipReducer,
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const placeShip = jest.requireMock('@/helpers').placeShip;
    placeShip.mockClear();
  });

  describe('Ship Direction Management', () => {
    test('should default to HORIZONTAL direction', () => {
      const board = initializeBoard();
      const { result } = renderHook(
        () => useShipPlacement('Destroyer', board),
        { wrapper },
      );

      expect(result.current.shipDirection).toBe('HORIZONTAL');
    });

    test('should reset to HORIZONTAL when new ship is selected', () => {
      const board = initializeBoard();
      const { result, rerender } = renderHook(
        ({ selectedShipName }) => useShipPlacement(selectedShipName, board),
        {
          wrapper,
          initialProps: { selectedShipName: 'Destroyer' },
        },
      );

      act(() => {
        result.current.handleRightClick(
          {
            preventDefault: jest.fn(),
          } as unknown as React.MouseEvent<HTMLDivElement>,
          0,
          0,
        );
      });
      expect(result.current.shipDirection).toBe('VERTICAL');

      rerender({ selectedShipName: 'Cruiser' });
      expect(result.current.shipDirection).toBe('HORIZONTAL');
    });

    test('should toggle direction on right click', () => {
      const board = initializeBoard();
      const { result } = renderHook(
        () => useShipPlacement('Destroyer', board),
        { wrapper },
      );

      act(() => {
        result.current.handleRightClick(
          {
            preventDefault: jest.fn(),
          } as unknown as React.MouseEvent<HTMLDivElement>,
          0,
          0,
        );
      });
      expect(result.current.shipDirection).toBe('VERTICAL');

      act(() => {
        result.current.handleRightClick(
          {
            preventDefault: jest.fn(),
          } as unknown as React.MouseEvent<HTMLDivElement>,
          0,
          0,
        );
      });
      expect(result.current.shipDirection).toBe('HORIZONTAL');
    });
  });

  describe('Current Ship Management', () => {
    test('should return null when no ship selected', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement(null, board), {
        wrapper,
      });

      expect(result.current.currentShip).toBeNull();
    });

    test('should create ship object for valid ship names', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement('Cruiser', board), {
        wrapper,
      });

      expect(result.current.currentShip).toEqual({
        x: 0,
        y: 0,
        length: 3,
        direction: 'HORIZONTAL',
      });
    });

    test('should return null for invalid ship names', () => {
      const board = initializeBoard();
      const { result } = renderHook(
        () => useShipPlacement('InvalidShip', board),
        { wrapper },
      );

      expect(result.current.currentShip).toBeNull();
    });
  });

  describe('Hover State Management', () => {
    test('should clear hover states when no current ship', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement(null, board), {
        wrapper,
      });

      act(() => {
        result.current.handleMouseOver(0, 0);
      });

      expect(result.current.hoveredCells.size).toBe(0);
      expect(result.current.invalidHoveredCells.size).toBe(0);
    });

    test('should set hovered cells for valid horizontal placement', () => {
      const board = initializeBoard();
      const { result } = renderHook(
        () => useShipPlacement('Cruiser', board), // length 3
        { wrapper },
      );

      act(() => {
        result.current.handleMouseOver(0, 0);
      });

      expect(result.current.hoveredCells).toEqual(
        new Set(['0-0', '0-1', '0-2']),
      );
      expect(result.current.invalidHoveredCells.size).toBe(0);
    });

    test('should set hovered cells for valid vertical placement', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement('Cruiser', board), {
        wrapper,
      });

      act(() => {
        result.current.handleRightClick(
          {
            preventDefault: jest.fn(),
          } as unknown as React.MouseEvent<HTMLDivElement>,
          0,
          0,
        );
      });

      act(() => {
        result.current.handleMouseOver(0, 0);
      });

      expect(result.current.hoveredCells).toEqual(
        new Set(['0-0', '1-0', '2-0']),
      );
      expect(result.current.invalidHoveredCells.size).toBe(0);
    });

    test('should set invalid hover when ship goes out of bounds horizontally', () => {
      const board = initializeBoard();
      const { result } = renderHook(
        () => useShipPlacement('Cruiser', board), // length 3
        { wrapper },
      );

      act(() => {
        result.current.handleMouseOver(0, 8); // Only 2 cells available (8, 9)
      });

      expect(result.current.hoveredCells.size).toBe(0);
      expect(result.current.invalidHoveredCells).toEqual(
        new Set(['0-8', '0-9']),
      );
    });

    test('should set invalid hover when ship goes out of bounds vertically', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement('Cruiser', board), {
        wrapper,
      });

      act(() => {
        result.current.handleRightClick(
          {
            preventDefault: jest.fn(),
          } as unknown as React.MouseEvent<HTMLDivElement>,
          0,
          0,
        );
      });

      act(() => {
        result.current.handleMouseOver(8, 0);
      });

      expect(result.current.hoveredCells.size).toBe(0);
      expect(result.current.invalidHoveredCells).toEqual(
        new Set(['8-0', '9-0']),
      );
    });

    test('should set invalid hover when overlapping existing ship', () => {
      const board = initializeBoard();
      board[0][1] = 'SHIP';

      const { result } = renderHook(() => useShipPlacement('Cruiser', board), {
        wrapper,
      });

      act(() => {
        result.current.handleMouseOver(0, 0);
      });

      expect(result.current.hoveredCells.size).toBe(0);
      expect(result.current.invalidHoveredCells).toEqual(
        new Set(['0-0', '0-1', '0-2']),
      );
    });

    test('should clear hover states on mouse out', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement('Cruiser', board), {
        wrapper,
      });

      act(() => {
        result.current.handleMouseOver(0, 0);
      });
      expect(result.current.hoveredCells.size).toBeGreaterThan(0);

      act(() => {
        result.current.handleMouseOut();
      });

      expect(result.current.hoveredCells.size).toBe(0);
      expect(result.current.invalidHoveredCells.size).toBe(0);
    });
  });

  describe('Ship Placement Execution', () => {
    test('should return original board when no current ship', () => {
      const board = initializeBoard();
      const { result } = renderHook(() => useShipPlacement(null, board), {
        wrapper,
      });

      const newBoard = result.current.handlePlace(0, 0, board);
      expect(newBoard).toBe(board);
    });

    test('should dispatch actions and call onBoardUpdate on successful placement', () => {
      const placeShip = jest.requireMock('@/helpers').placeShip;
      const mockBoard = initializeBoard();
      const newBoard = initializeBoard();
      newBoard[0][0] = 'SHIP';

      placeShip.mockReturnValue(newBoard);
      const onBoardUpdate = jest.fn();

      const { result } = renderHook(
        () => useShipPlacement('Destroyer', mockBoard, onBoardUpdate),
        { wrapper },
      );

      act(() => {
        result.current.handlePlace(0, 0, mockBoard);
      });

      expect(placeShip).toHaveBeenCalledWith(
        mockBoard,
        0,
        0,
        expect.objectContaining({
          length: 1,
          direction: 'HORIZONTAL',
        }),
      );
      expect(onBoardUpdate).toHaveBeenCalledWith(newBoard);
    });

    test('should return original board when placement fails', () => {
      const placeShip = jest.requireMock('@/helpers').placeShip;
      const board = initializeBoard();

      placeShip.mockReturnValue(board);

      const { result } = renderHook(
        () => useShipPlacement('Destroyer', board),
        { wrapper },
      );

      const resultBoard = result.current.handlePlace(0, 0, board);
      expect(resultBoard).toBe(board);
    });
  });

  describe('Ship Size Variations', () => {
    test.each([
      ['Destroyer', 1],
      ['Submarine', 2],
      ['Cruiser', 3],
      ['Battleship', 4],
      ['Carrier', 5],
    ])(
      'should create correct ship length for %s',
      (shipName, expectedLength) => {
        const board = initializeBoard();
        const { result } = renderHook(() => useShipPlacement(shipName, board), {
          wrapper,
        });

        expect(result.current.currentShip?.length).toBe(expectedLength);
      },
    );
  });

  describe('Edge Cases', () => {
    test('should handle empty board gracefully', () => {
      const emptyBoard: CellStatus[][] = [];
      const { result } = renderHook(
        () => useShipPlacement('Destroyer', emptyBoard),
        { wrapper },
      );

      act(() => {
        result.current.handleMouseOver(0, 0);
      });

      expect(result.current.invalidHoveredCells.size).toBe(0);
      expect(result.current.hoveredCells.size).toBe(0);
    });

    test('should prevent default on right click', () => {
      const board = initializeBoard();
      const { result } = renderHook(
        () => useShipPlacement('Destroyer', board),
        { wrapper },
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent<HTMLDivElement>;

      act(() => {
        result.current.handleRightClick(mockEvent, 0, 0);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });
});
