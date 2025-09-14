import React from 'react';
import { render, screen } from '@testing-library/react';
import PlacementBoard from '../PlacementBoard';
import { initializeBoard } from '@/helpers';
import { Board, PlacedShip, CellStatus } from '@/types';

const mockHandleMouseOver = jest.fn();
const mockHandleMouseOut = jest.fn();
const mockHandleRightClick = jest.fn();
const mockHandlePlace = jest.fn();

jest.mock('@/hooks/useShipPlacement', () => ({
  useShipPlacement: jest.fn(),
}));

jest.mock('@/hooks/useBoardRenderer', () => ({
  useBoardRenderer: jest.fn(),
}));

import { useShipPlacement } from '@/hooks/useShipPlacement';
import { useBoardRenderer } from '@/hooks/useBoardRenderer';

const mockUseShipPlacement = useShipPlacement as jest.MockedFunction<
  typeof useShipPlacement
>;
const mockUseBoardRenderer = useBoardRenderer as jest.MockedFunction<
  typeof useBoardRenderer
>;

describe('PlacementBoard', () => {
  const mockBoard = initializeBoard();
  const mockOnBoardUpdate = jest.fn();

  const defaultShipPlacementReturn = {
    currentShip: null as PlacedShip | null,
    shipDirection: 'HORIZONTAL' as 'HORIZONTAL' | 'VERTICAL',
    hoveredCells: new Set<string>(),
    invalidHoveredCells: new Set<string>(),
    handleMouseOver: mockHandleMouseOver,
    handleMouseOut: mockHandleMouseOut,
    handleRightClick: mockHandleRightClick,
    handlePlace: mockHandlePlace,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShipPlacement.mockReturnValue(defaultShipPlacementReturn);
    mockUseBoardRenderer.mockReturnValue(
      <div data-testid="rendered-board">Mock Board</div>,
    );
  });

  describe('Basic Rendering', () => {
    test('renders without crashing with required props', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('renders with all props including onBoardUpdate', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Cruiser"
          onBoardUpdate={mockOnBoardUpdate}
        />,
      );

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('renders with null selectedShipName', () => {
      render(
        <PlacementBoard initialBoard={mockBoard} selectedShipName={null} />,
      );

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('applies correct CSS classes to wrapper', () => {
      const { container } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('board-grid');
    });
  });

  describe('Hook Integration', () => {
    test('calls useShipPlacement with correct parameters', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Battleship"
          onBoardUpdate={mockOnBoardUpdate}
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenCalledWith(
        'Battleship',
        mockBoard,
        mockOnBoardUpdate,
      );
    });

    test('calls useBoardRenderer with initialBoard and renderCellContent function', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mockBoard,
        expect.any(Function),
      );
    });

    test('passes correct board to useBoardRenderer when board changes', () => {
      const newBoard = initializeBoard();
      newBoard[0][0] = 'SHIP';

      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      rerender(
        <PlacementBoard initialBoard={newBoard} selectedShipName="Destroyer" />,
      );

      expect(mockUseBoardRenderer).toHaveBeenLastCalledWith(
        newBoard,
        expect.any(Function),
      );
    });

    test('useShipPlacement hook receives updated props', () => {
      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
        'Destroyer',
        mockBoard,
        undefined,
      );

      const newBoard = initializeBoard();
      newBoard[1][1] = 'SHIP';

      rerender(
        <PlacementBoard
          initialBoard={newBoard}
          selectedShipName="Carrier"
          onBoardUpdate={mockOnBoardUpdate}
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
        'Carrier',
        newBoard,
        mockOnBoardUpdate,
      );
    });
  });

  describe('Ship Selection Changes', () => {
    test('updates handlers when selectedShipName changes', () => {
      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
        'Destroyer',
        mockBoard,
        undefined,
      );

      rerender(
        <PlacementBoard initialBoard={mockBoard} selectedShipName="Cruiser" />,
      );

      expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
        'Cruiser',
        mockBoard,
        undefined,
      );
    });

    test('handles transition from null to selected ship', () => {
      const { rerender } = render(
        <PlacementBoard initialBoard={mockBoard} selectedShipName={null} />,
      );

      rerender(
        <PlacementBoard initialBoard={mockBoard} selectedShipName="Carrier" />,
      );

      expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
        'Carrier',
        mockBoard,
        undefined,
      );
    });

    test('handles transition from selected ship to null', () => {
      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      rerender(
        <PlacementBoard initialBoard={mockBoard} selectedShipName={null} />,
      );

      expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
        null,
        mockBoard,
        undefined,
      );
    });

    test('handles all ship types', () => {
      const ships = [
        'Destroyer',
        'Submarine',
        'Cruiser',
        'Battleship',
        'Carrier',
      ];

      ships.forEach((ship) => {
        render(
          <PlacementBoard initialBoard={mockBoard} selectedShipName={ship} />,
        );

        expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
          ship,
          mockBoard,
          undefined,
        );
      });
    });
  });

  describe('Board State Management', () => {
    test('handles empty board', () => {
      const emptyBoard: Board = [];

      render(
        <PlacementBoard
          initialBoard={emptyBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenCalledWith(
        'Destroyer',
        emptyBoard,
        undefined,
      );
      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        emptyBoard,
        expect.any(Function),
      );
    });

    test('handles board with existing ships', () => {
      const boardWithShips = initializeBoard();
      boardWithShips[0][0] = 'SHIP';
      boardWithShips[0][1] = 'SHIP';
      boardWithShips[5][5] = 'HIT';

      render(
        <PlacementBoard
          initialBoard={boardWithShips}
          selectedShipName="Submarine"
        />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        boardWithShips,
        expect.any(Function),
      );
    });

    test('calls onBoardUpdate when provided', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
          onBoardUpdate={mockOnBoardUpdate}
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenCalledWith(
        'Destroyer',
        mockBoard,
        mockOnBoardUpdate,
      );
    });

    test('does not pass onBoardUpdate when not provided', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenCalledWith(
        'Destroyer',
        mockBoard,
        undefined,
      );
    });
  });

  describe('Hook State Changes', () => {
    test('responds to hover state changes from useShipPlacement', () => {
      const hoveredCells = new Set(['0-0', '0-1', '0-2']);
      mockUseShipPlacement.mockReturnValue({
        ...defaultShipPlacementReturn,
        hoveredCells,
      });

      render(
        <PlacementBoard initialBoard={mockBoard} selectedShipName="Cruiser" />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mockBoard,
        expect.any(Function),
      );
    });

    test('responds to invalid hover state changes', () => {
      const invalidHoveredCells = new Set(['0-8', '0-9']);
      mockUseShipPlacement.mockReturnValue({
        ...defaultShipPlacementReturn,
        invalidHoveredCells,
      });

      render(
        <PlacementBoard initialBoard={mockBoard} selectedShipName="Cruiser" />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mockBoard,
        expect.any(Function),
      );
    });

    test('integration with useShipPlacement handlers', () => {
      const customHandlers = {
        ...defaultShipPlacementReturn,
        handlePlace: jest.fn(),
        handleMouseOver: jest.fn(),
        handleRightClick: jest.fn(),
        handleMouseOut: jest.fn(),
      };

      mockUseShipPlacement.mockReturnValue(customHandlers);

      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mockBoard,
        expect.any(Function),
      );
    });
  });

  describe('Performance & Memoization', () => {
    test('useBoardRenderer is called on every render', () => {
      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      const firstRenderCalls = mockUseBoardRenderer.mock.calls.length;

      rerender(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseBoardRenderer.mock.calls.length).toBeGreaterThan(
        firstRenderCalls,
      );
    });

    test('renderCellContent function changes when hover state changes', () => {
      let renderCellContentRef:
        | ((row: CellStatus[], rowIndex: number) => React.ReactNode[])
        | null = null;

      mockUseBoardRenderer.mockImplementation((_board, renderCellContent) => {
        renderCellContentRef = renderCellContent;
        return <div data-testid="rendered-board">Mock Board</div>;
      });

      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      const firstRenderFunction = renderCellContentRef;

      mockUseShipPlacement.mockReturnValue({
        ...defaultShipPlacementReturn,
        hoveredCells: new Set(['0-0']),
      });

      rerender(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(renderCellContentRef).not.toBe(firstRenderFunction);
    });
  });

  describe('Edge Cases', () => {
    test('handles very large boards', () => {
      const largeBoard: Board = Array.from({ length: 20 }, () =>
        Array.from({ length: 20 }, () => 'EMPTY'),
      );

      render(
        <PlacementBoard initialBoard={largeBoard} selectedShipName="Carrier" />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        largeBoard,
        expect.any(Function),
      );
    });

    test('handles board with all cell types', () => {
      const mixedBoard = initializeBoard();
      mixedBoard[0][0] = 'SHIP';
      mixedBoard[1][1] = 'HIT';
      mixedBoard[2][2] = 'MISS';
      mixedBoard[3][3] = 'EMPTY';

      render(
        <PlacementBoard
          initialBoard={mixedBoard}
          selectedShipName="Destroyer"
        />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mixedBoard,
        expect.any(Function),
      );
    });

    test('handles rapid ship selection changes', () => {
      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
        />,
      );

      const ships = ['Submarine', 'Cruiser', 'Battleship', 'Carrier', null];

      ships.forEach((ship) => {
        rerender(
          <PlacementBoard initialBoard={mockBoard} selectedShipName={ship} />,
        );

        expect(mockUseShipPlacement).toHaveBeenLastCalledWith(
          ship,
          mockBoard,
          undefined,
        );
      });
    });

    test('handles board updates during component lifecycle', () => {
      const boards = [
        initializeBoard(),
        (() => {
          const b = initializeBoard();
          b[0][0] = 'SHIP';
          return b;
        })(),
        (() => {
          const b = initializeBoard();
          b[1][1] = 'HIT';
          return b;
        })(),
        (() => {
          const b = initializeBoard();
          b[2][2] = 'MISS';
          return b;
        })(),
      ];

      const { rerender } = render(
        <PlacementBoard
          initialBoard={boards[0]}
          selectedShipName="Destroyer"
        />,
      );

      boards.slice(1).forEach((board) => {
        rerender(
          <PlacementBoard initialBoard={board} selectedShipName="Destroyer" />,
        );

        expect(mockUseBoardRenderer).toHaveBeenLastCalledWith(
          board,
          expect.any(Function),
        );
      });
    });

    test('handles undefined onBoardUpdate gracefully', () => {
      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
          onBoardUpdate={undefined}
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenCalledWith(
        'Destroyer',
        mockBoard,
        undefined,
      );
    });
  });

  describe('Component Integration', () => {
    test('integrates with all hook return values correctly', () => {
      const complexHookReturn = {
        ...defaultShipPlacementReturn,
        hoveredCells: new Set(['1-1', '1-2', '1-3']),
        invalidHoveredCells: new Set(['9-8', '9-9']),
        handleMouseOver: jest.fn(),
        handleMouseOut: jest.fn(),
        handleRightClick: jest.fn(),
        handlePlace: jest.fn(),
      };

      mockUseShipPlacement.mockReturnValue(complexHookReturn);

      render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Battleship"
          onBoardUpdate={mockOnBoardUpdate}
        />,
      );

      expect(mockUseShipPlacement).toHaveBeenCalledWith(
        'Battleship',
        mockBoard,
        mockOnBoardUpdate,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mockBoard,
        expect.any(Function),
      );
    });

    test('maintains component stability across re-renders', () => {
      const { rerender } = render(
        <PlacementBoard
          initialBoard={mockBoard}
          selectedShipName="Destroyer"
          onBoardUpdate={mockOnBoardUpdate}
        />,
      );

      const initialCallCount = mockUseShipPlacement.mock.calls.length;

      for (let i = 0; i < 3; i++) {
        rerender(
          <PlacementBoard
            initialBoard={mockBoard}
            selectedShipName="Destroyer"
            onBoardUpdate={mockOnBoardUpdate}
          />,
        );
      }

      expect(mockUseShipPlacement.mock.calls.length).toBe(initialCallCount + 3);

      mockUseShipPlacement.mock.calls
        .slice(initialCallCount)
        .forEach((call) => {
          expect(call).toEqual(['Destroyer', mockBoard, mockOnBoardUpdate]);
        });
    });
  });
});
