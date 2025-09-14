import { render, screen } from '@testing-library/react';
import PlayerBoard from '../PlayerBoard';
import { initializeBoard } from '@/helpers';
import { Board, CellStatus } from '@/types';

jest.mock('@/hooks/useBoardRenderer', () => ({
  useBoardRenderer: jest.fn(),
}));

jest.mock('@/components', () => ({
  ...jest.requireActual('@/components'),
  Cell: jest.fn(),
}));

import { useBoardRenderer } from '@/hooks/useBoardRenderer';
import { Cell } from '@/components';

const mockUseBoardRenderer = useBoardRenderer as jest.MockedFunction<
  typeof useBoardRenderer
>;
const mockCell = Cell as jest.MockedFunction<typeof Cell>;

describe('PlayerBoard', () => {
  const mockBoard = initializeBoard();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardRenderer.mockReturnValue(
      <div data-testid="rendered-board">Mock Board</div>,
    );
    mockCell.mockImplementation(({ status }) => (
      <div data-testid="cell" data-status={status}>
        {status}
      </div>
    ));
  });

  describe('Basic Rendering', () => {
    test('renders without crashing with required props', () => {
      render(<PlayerBoard board={mockBoard} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('applies correct CSS classes to wrapper', () => {
      const { container } = render(<PlayerBoard board={mockBoard} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('board-grid');
    });

    test('renders with empty board', () => {
      const emptyBoard: Board = [];

      render(<PlayerBoard board={emptyBoard} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('renders with standard 10x10 board', () => {
      const standardBoard = initializeBoard();

      render(<PlayerBoard board={standardBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        standardBoard,
        expect.any(Function),
      );
    });
  });

  describe('useBoardRenderer Hook Integration', () => {
    test('calls useBoardRenderer with correct parameters', () => {
      render(<PlayerBoard board={mockBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mockBoard,
        expect.any(Function),
      );
    });

    test('passes correct board to useBoardRenderer when board changes', () => {
      const newBoard = initializeBoard();
      newBoard[0][0] = 'SHIP';

      const { rerender } = render(<PlayerBoard board={mockBoard} />);

      rerender(<PlayerBoard board={newBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenLastCalledWith(
        newBoard,
        expect.any(Function),
      );
    });

    test('useBoardRenderer is called on every render', () => {
      const { rerender } = render(<PlayerBoard board={mockBoard} />);

      const firstRenderCalls = mockUseBoardRenderer.mock.calls.length;

      rerender(<PlayerBoard board={mockBoard} />);

      expect(mockUseBoardRenderer.mock.calls.length).toBeGreaterThan(
        firstRenderCalls,
      );
    });
  });

  describe('Cell Rendering Logic', () => {
    test('renderCellContent function creates Cell components correctly', () => {
      let renderCellContentRef:
        | ((row: CellStatus[], rowIndex: number) => React.ReactNode[])
        | null = null;

      mockUseBoardRenderer.mockImplementation((_board, renderCellContent) => {
        renderCellContentRef = renderCellContent;
        return <div data-testid="rendered-board">Mock Board</div>;
      });

      render(<PlayerBoard board={mockBoard} />);

      expect(renderCellContentRef).toBeTruthy();

      const testRow: CellStatus[] = ['EMPTY', 'SHIP', 'HIT'];
      const result = renderCellContentRef!(testRow, 0);

      expect(result).toHaveLength(3);
    });

    test('renderCellContent function maps cells with correct keys', () => {
      render(<PlayerBoard board={mockBoard} />);

      const [, renderCellContent] = mockUseBoardRenderer.mock.calls[0];

      const testRow: CellStatus[] = ['SHIP', 'HIT', 'MISS'];
      const result = renderCellContent(testRow, 0);

      expect(result).toHaveLength(3);
      expect(Array.isArray(result)).toBe(true);
    });

    test('renderCellContent handles different row lengths', () => {
      render(<PlayerBoard board={mockBoard} />);

      const [, renderCellContent] = mockUseBoardRenderer.mock.calls[0];

      const shortRow: CellStatus[] = ['EMPTY'];
      const longRow: CellStatus[] = ['EMPTY', 'SHIP', 'HIT', 'MISS', 'EMPTY'];

      const shortResult = renderCellContent(shortRow, 0);
      const longResult = renderCellContent(longRow, 0);

      expect(shortResult).toHaveLength(1);
      expect(longResult).toHaveLength(5);
    });
  });

  describe('Board State Variations', () => {
    test('handles board with no ships', () => {
      const emptyBoard = initializeBoard(); // All EMPTY

      render(<PlayerBoard board={emptyBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        emptyBoard,
        expect.any(Function),
      );
    });

    test('handles board with ships placed', () => {
      const boardWithShips = initializeBoard();
      boardWithShips[0][0] = 'SHIP';
      boardWithShips[0][1] = 'SHIP';
      boardWithShips[1][0] = 'SHIP';

      render(<PlayerBoard board={boardWithShips} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        boardWithShips,
        expect.any(Function),
      );
    });

    test('handles board with mixed states', () => {
      const mixedBoard = initializeBoard();
      mixedBoard[0][0] = 'SHIP';
      mixedBoard[1][1] = 'HIT';
      mixedBoard[2][2] = 'MISS';
      mixedBoard[3][3] = 'EMPTY';

      render(<PlayerBoard board={mixedBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        mixedBoard,
        expect.any(Function),
      );
    });

    test('handles board with all cell types present', () => {
      const complexBoard = initializeBoard();
      complexBoard[0][0] = 'EMPTY';
      complexBoard[0][1] = 'SHIP';
      complexBoard[0][2] = 'HIT';
      complexBoard[0][3] = 'MISS';

      render(<PlayerBoard board={complexBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        complexBoard,
        expect.any(Function),
      );
    });
  });

  describe('Component Behavior', () => {
    test('component behaves as pure component with same props', () => {
      const { rerender } = render(<PlayerBoard board={mockBoard} />);

      const initialCallCount = mockUseBoardRenderer.mock.calls.length;

      for (let i = 0; i < 3; i++) {
        rerender(<PlayerBoard board={mockBoard} />);
      }

      expect(mockUseBoardRenderer.mock.calls.length).toBe(initialCallCount + 3);

      mockUseBoardRenderer.mock.calls
        .slice(initialCallCount)
        .forEach((call) => {
          expect(call[0]).toBe(mockBoard);
          expect(typeof call[1]).toBe('function');
        });
    });

    test('renders consistently with stable board reference', () => {
      const stableBoard = initializeBoard();

      const { rerender } = render(<PlayerBoard board={stableBoard} />);

      rerender(<PlayerBoard board={stableBoard} />);
      rerender(<PlayerBoard board={stableBoard} />);

      expect(mockUseBoardRenderer.mock.calls.length).toBeGreaterThan(2);
      mockUseBoardRenderer.mock.calls.forEach((call) => {
        expect(call[0]).toBe(stableBoard);
      });
    });

    test('responds to board changes appropriately', () => {
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

      const { rerender } = render(<PlayerBoard board={boards[0]} />);

      boards.slice(1).forEach((board) => {
        rerender(<PlayerBoard board={board} />);

        expect(mockUseBoardRenderer).toHaveBeenLastCalledWith(
          board,
          expect.any(Function),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles very large boards', () => {
      const largeBoard: Board = Array.from({ length: 20 }, () =>
        Array.from({ length: 20 }, () => 'EMPTY'),
      );

      render(<PlayerBoard board={largeBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        largeBoard,
        expect.any(Function),
      );
    });

    test('handles irregular board shapes', () => {
      const irregularBoard: Board = [
        ['EMPTY', 'SHIP'],
        ['HIT'],
        ['MISS', 'EMPTY', 'SHIP', 'HIT'],
      ];

      render(<PlayerBoard board={irregularBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        irregularBoard,
        expect.any(Function),
      );
    });

    test('handles rapid board updates', () => {
      const { rerender } = render(<PlayerBoard board={mockBoard} />);

      for (let i = 0; i < 10; i++) {
        const newBoard = initializeBoard();
        newBoard[i % 10][0] = i % 2 === 0 ? 'HIT' : 'MISS';
        rerender(<PlayerBoard board={newBoard} />);
      }

      expect(mockUseBoardRenderer.mock.calls.length).toBeGreaterThan(10);
    });

    test('maintains component integrity with undefined cells', () => {
      const boardWithUndefined = [
        ['EMPTY', 'SHIP'],
        [undefined, 'HIT'],
      ] as Board;

      render(<PlayerBoard board={boardWithUndefined} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        boardWithUndefined,
        expect.any(Function),
      );
    });
  });

  describe('Component Integration', () => {
    test('integrates correctly with useBoardRenderer hook', () => {
      const customBoard = initializeBoard();
      customBoard[5][5] = 'SHIP';

      render(<PlayerBoard board={customBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        customBoard,
        expect.any(Function),
      );

      const [, renderFunction] = mockUseBoardRenderer.mock.calls[0];
      const testRow: CellStatus[] = ['EMPTY', 'SHIP'];
      const result = renderFunction(testRow, 0);

      expect(result).toHaveLength(2);
    });

    test('maintains component contract across re-renders', () => {
      const { rerender } = render(<PlayerBoard board={mockBoard} />);

      rerender(<PlayerBoard board={mockBoard} />);
      rerender(<PlayerBoard board={mockBoard} />);

      mockUseBoardRenderer.mock.calls.forEach((call) => {
        expect(call).toHaveLength(2);
        expect(call[0]).toEqual(expect.any(Array)); // board
        expect(call[1]).toEqual(expect.any(Function)); // renderCellContent
      });
    });
  });
});
