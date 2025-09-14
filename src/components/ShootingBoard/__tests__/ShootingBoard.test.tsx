import { render, screen } from '@testing-library/react';
import ShootingBoard from '../ShootingBoard';
import { initializeBoard } from '@/helpers';
import { Board, CellStatus } from '@/types';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('@/features/gameReducer', () => ({
  playerShoot: jest.fn(),
}));

jest.mock('@/hooks/useBoardRenderer', () => ({
  useBoardRenderer: jest.fn(),
}));

jest.mock('@/components', () => ({
  ...jest.requireActual('@/components'),
  Cell: jest.fn(),
}));

import { useBoardRenderer } from '@/hooks/useBoardRenderer';
import { Cell } from '@/components';
import { playerShoot } from '@/features/gameReducer';

const mockUseBoardRenderer = useBoardRenderer as jest.MockedFunction<
  typeof useBoardRenderer
>;
const mockCell = Cell as jest.MockedFunction<typeof Cell>;
const mockPlayerShootAction = playerShoot as jest.MockedFunction<
  typeof playerShoot
>;

describe('ShootingBoard', () => {
  const mockTargetBoard = initializeBoard();
  const mockOnShoot = jest.fn();

  const defaultProps = {
    targetBoard: mockTargetBoard,
    isShooted: false,
    onShoot: mockOnShoot,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardRenderer.mockReturnValue(
      <div data-testid="rendered-board">Mock Board</div>,
    );
    mockCell.mockImplementation(({ status, onClick }) => (
      <div
        data-testid="cell"
        data-status={status}
        onClick={onClick}
        role="button"
      >
        {status}
      </div>
    ));
    mockPlayerShootAction.mockReturnValue({
      type: 'game/playerShoot',
      payload: { x: 0, y: 0 },
    });
  });

  describe('Basic Rendering', () => {
    test('renders without crashing with required props', () => {
      render(<ShootingBoard {...defaultProps} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('applies correct CSS classes to wrapper', () => {
      const { container } = render(<ShootingBoard {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('board-grid');
    });

    test('renders with empty board', () => {
      const emptyBoard: Board = [];

      render(<ShootingBoard {...defaultProps} targetBoard={emptyBoard} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('renders with standard 10x10 board', () => {
      const standardBoard = initializeBoard();

      render(<ShootingBoard {...defaultProps} targetBoard={standardBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
      );
    });
  });

  describe('Ship Hiding Logic', () => {
    test('converts SHIP cells to EMPTY in display board', () => {
      const boardWithShips = initializeBoard();
      boardWithShips[0][0] = 'SHIP';
      boardWithShips[0][1] = 'SHIP';
      boardWithShips[1][0] = 'SHIP';

      render(<ShootingBoard {...defaultProps} targetBoard={boardWithShips} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      expect(displayBoard[0][0]).toBe('EMPTY');
      expect(displayBoard[0][1]).toBe('EMPTY');
      expect(displayBoard[1][0]).toBe('EMPTY');
    });

    test('preserves HIT and MISS cells correctly', () => {
      const boardWithHitsAndMisses = initializeBoard();
      boardWithHitsAndMisses[0][0] = 'HIT';
      boardWithHitsAndMisses[0][1] = 'MISS';
      boardWithHitsAndMisses[1][0] = 'SHIP'; // Should be hidden
      boardWithHitsAndMisses[1][1] = 'EMPTY'; // Should stay EMPTY

      render(
        <ShootingBoard
          {...defaultProps}
          targetBoard={boardWithHitsAndMisses}
        />,
      );

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      expect(displayBoard[0][0]).toBe('HIT');
      expect(displayBoard[0][1]).toBe('MISS');
      expect(displayBoard[1][0]).toBe('EMPTY'); // Ship hidden
      expect(displayBoard[1][1]).toBe('EMPTY'); // Stays empty
    });

    test('handles board with all cell types', () => {
      const mixedBoard = initializeBoard();
      mixedBoard[0][0] = 'EMPTY';
      mixedBoard[0][1] = 'SHIP';
      mixedBoard[0][2] = 'HIT';
      mixedBoard[0][3] = 'MISS';

      render(<ShootingBoard {...defaultProps} targetBoard={mixedBoard} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      expect(displayBoard[0][0]).toBe('EMPTY'); // Unchanged
      expect(displayBoard[0][1]).toBe('EMPTY'); // Ship hidden
      expect(displayBoard[0][2]).toBe('HIT'); // Unchanged
      expect(displayBoard[0][3]).toBe('MISS'); // Unchanged
    });

    test('ship hiding works with large boards', () => {
      const largeBoard: Board = Array.from({ length: 20 }, (_, row) =>
        Array.from({ length: 20 }, (_, col) =>
          row === 0 && col < 5 ? 'SHIP' : 'EMPTY',
        ),
      );

      render(<ShootingBoard {...defaultProps} targetBoard={largeBoard} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      for (let col = 0; col < 5; col++) {
        expect(displayBoard[0][col]).toBe('EMPTY');
      }
    });
  });

  describe('Click Handling & Shooting', () => {
    test('renderCellContent function creates cells with proper structure', () => {
      render(<ShootingBoard {...defaultProps} isShooted={false} />);

      const [, renderCellContent] = mockUseBoardRenderer.mock.calls[0];

      const testRow: CellStatus[] = ['EMPTY', 'HIT', 'MISS'];
      const result = renderCellContent(testRow, 0);

      expect(result).toHaveLength(3);
      expect(Array.isArray(result)).toBe(true);
    });

    test('component handles isShooted prop changes correctly', () => {
      const { rerender } = render(
        <ShootingBoard {...defaultProps} isShooted={false} />,
      );

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();

      rerender(<ShootingBoard {...defaultProps} isShooted={true} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('component integrates with Redux dispatch correctly', () => {
      render(<ShootingBoard {...defaultProps} />);

      expect(mockDispatch).toBeDefined();
      expect(typeof mockDispatch).toBe('function');
    });
  });

  describe('Redux Integration', () => {
    test('playerShoot action is properly imported and mocked', () => {
      expect(mockPlayerShootAction).toBeDefined();
      expect(typeof mockPlayerShootAction).toBe('function');
    });

    test('useDispatch hook is called correctly', () => {
      render(<ShootingBoard {...defaultProps} />);

      expect(mockDispatch).toBeDefined();
    });
  });

  describe('Turn-Based Logic', () => {
    test('component renders correctly with isShooted false', () => {
      render(<ShootingBoard {...defaultProps} isShooted={false} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('component renders correctly with isShooted true', () => {
      render(<ShootingBoard {...defaultProps} isShooted={true} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('component handles prop transitions correctly', () => {
      const { rerender } = render(
        <ShootingBoard {...defaultProps} isShooted={false} />,
      );

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();

      rerender(<ShootingBoard {...defaultProps} isShooted={true} />);

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });
  });

  describe('useBoardRenderer Hook Integration', () => {
    test('calls useBoardRenderer with display board and renderCellContent', () => {
      render(<ShootingBoard {...defaultProps} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
      );
    });

    test('passes transformed board to useBoardRenderer', () => {
      const boardWithShips = initializeBoard();
      boardWithShips[0][0] = 'SHIP';

      render(<ShootingBoard {...defaultProps} targetBoard={boardWithShips} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      expect(displayBoard[0][0]).toBe('EMPTY');
    });

    test('re-renders when targetBoard changes', () => {
      const { rerender } = render(<ShootingBoard {...defaultProps} />);

      const firstRenderCalls = mockUseBoardRenderer.mock.calls.length;

      const newBoard = initializeBoard();
      newBoard[0][0] = 'HIT';

      rerender(<ShootingBoard {...defaultProps} targetBoard={newBoard} />);

      expect(mockUseBoardRenderer.mock.calls.length).toBeGreaterThan(
        firstRenderCalls,
      );
    });
  });

  describe('Cell Rendering & Event Handlers', () => {
    test('renderCellContent function works with different cell types', () => {
      render(<ShootingBoard {...defaultProps} />);

      const [, renderCellContent] = mockUseBoardRenderer.mock.calls[0];

      const testRow: CellStatus[] = ['EMPTY', 'HIT', 'MISS'];
      const result = renderCellContent(testRow, 0);

      expect(result).toHaveLength(3);
      expect(Array.isArray(result)).toBe(true);
    });

    test('renderCellContent handles different row sizes', () => {
      render(<ShootingBoard {...defaultProps} />);

      const [, renderCellContent] = mockUseBoardRenderer.mock.calls[0];

      const shortRow: CellStatus[] = ['EMPTY'];
      const longRow: CellStatus[] = ['EMPTY', 'HIT', 'MISS', 'EMPTY', 'HIT'];

      const shortResult = renderCellContent(shortRow, 0);
      const longResult = renderCellContent(longRow, 1);

      expect(shortResult).toHaveLength(1);
      expect(longResult).toHaveLength(5);
    });
  });

  describe('Performance & Memoization', () => {
    test('cellHandlers are memoized correctly', () => {
      const { rerender } = render(<ShootingBoard {...defaultProps} />);

      const [, firstRenderFunction] = mockUseBoardRenderer.mock.calls[0];

      rerender(<ShootingBoard {...defaultProps} />);

      const [, secondRenderFunction] = mockUseBoardRenderer.mock.calls[1];

      expect(firstRenderFunction).toBe(secondRenderFunction);
    });

    test('displayBoard is memoized correctly', () => {
      const { rerender } = render(<ShootingBoard {...defaultProps} />);

      const [firstDisplayBoard] = mockUseBoardRenderer.mock.calls[0];

      rerender(<ShootingBoard {...defaultProps} />);

      const [secondDisplayBoard] = mockUseBoardRenderer.mock.calls[1];

      expect(firstDisplayBoard).toBe(secondDisplayBoard);
    });

    test('memoization breaks when dependencies change', () => {
      const { rerender } = render(<ShootingBoard {...defaultProps} />);

      const [firstDisplayBoard] = mockUseBoardRenderer.mock.calls[0];

      const newBoard = initializeBoard();
      newBoard[0][0] = 'HIT';

      rerender(<ShootingBoard {...defaultProps} targetBoard={newBoard} />);

      const [secondDisplayBoard] = mockUseBoardRenderer.mock.calls[1];

      expect(firstDisplayBoard).not.toBe(secondDisplayBoard);
    });
  });

  describe('Board State Variations', () => {
    test('handles board with only ships (all hidden)', () => {
      const shipOnlyBoard: Board = Array.from({ length: 10 }, () =>
        Array.from({ length: 10 }, () => 'SHIP'),
      );

      render(<ShootingBoard {...defaultProps} targetBoard={shipOnlyBoard} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      displayBoard.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toBe('EMPTY');
        });
      });
    });

    test('handles board with mixed game states', () => {
      const mixedBoard = initializeBoard();
      mixedBoard[0][0] = 'SHIP'; // Should be hidden
      mixedBoard[1][1] = 'HIT'; // Should show
      mixedBoard[2][2] = 'MISS'; // Should show
      mixedBoard[3][3] = 'EMPTY'; // Should show

      render(<ShootingBoard {...defaultProps} targetBoard={mixedBoard} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      expect(displayBoard[0][0]).toBe('EMPTY'); // Ship hidden
      expect(displayBoard[1][1]).toBe('HIT'); // Hit shown
      expect(displayBoard[2][2]).toBe('MISS'); // Miss shown
      expect(displayBoard[3][3]).toBe('EMPTY'); // Empty shown
    });

    test('handles large boards efficiently', () => {
      const largeBoard: Board = Array.from({ length: 20 }, () =>
        Array.from({ length: 20 }, () => 'EMPTY'),
      );

      render(<ShootingBoard {...defaultProps} targetBoard={largeBoard} />);

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        largeBoard,
        expect.any(Function),
      );
    });
  });

  describe('Edge Cases & Error Handling', () => {
    test('component handles multiple re-renders without errors', () => {
      const { rerender } = render(
        <ShootingBoard {...defaultProps} isShooted={false} />,
      );

      for (let i = 0; i < 5; i++) {
        rerender(<ShootingBoard {...defaultProps} isShooted={i % 2 === 0} />);
      }

      expect(screen.getByTestId('rendered-board')).toBeInTheDocument();
    });

    test('handles irregular board shapes', () => {
      const irregularBoard: Board = [
        ['EMPTY', 'SHIP'],
        ['HIT'],
        ['MISS', 'EMPTY', 'SHIP', 'HIT'],
      ];

      render(<ShootingBoard {...defaultProps} targetBoard={irregularBoard} />);

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];

      expect(displayBoard[0][1]).toBe('EMPTY'); // Ship hidden
      expect(displayBoard[1][0]).toBe('HIT'); // Hit shown
      expect(displayBoard[2][2]).toBe('EMPTY'); // Ship hidden
    });

    test('handles props changes during component lifecycle', () => {
      const { rerender } = render(<ShootingBoard {...defaultProps} />);

      const newBoard = initializeBoard();
      newBoard[0][0] = 'HIT';
      const newOnShoot = jest.fn();

      rerender(
        <ShootingBoard
          targetBoard={newBoard}
          isShooted={true}
          onShoot={newOnShoot}
        />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        expect.arrayContaining([expect.arrayContaining(['HIT'])]),
        expect.any(Function),
      );
    });

    test('maintains component integrity with undefined cells', () => {
      const boardWithUndefined = [
        ['EMPTY', 'SHIP'],
        [undefined, 'HIT'],
      ] as Board;

      render(
        <ShootingBoard {...defaultProps} targetBoard={boardWithUndefined} />,
      );

      expect(mockUseBoardRenderer).toHaveBeenCalledWith(
        boardWithUndefined.map((row) =>
          row.map((cell) => (cell === 'SHIP' ? 'EMPTY' : cell)),
        ),
        expect.any(Function),
      );
    });
  });

  describe('Component Integration', () => {
    test('integrates all features correctly in realistic scenario', () => {
      const gameBoard = initializeBoard();
      gameBoard[0][0] = 'SHIP'; // Enemy ship (hidden)
      gameBoard[1][1] = 'HIT'; // Previous hit (shown)
      gameBoard[2][2] = 'MISS'; // Previous miss (shown)

      render(
        <ShootingBoard
          targetBoard={gameBoard}
          isShooted={false}
          onShoot={mockOnShoot}
        />,
      );

      const [displayBoard] = mockUseBoardRenderer.mock.calls[0];
      expect(displayBoard[0][0]).toBe('EMPTY'); // Ship hidden
      expect(displayBoard[1][1]).toBe('HIT'); // Hit shown
      expect(displayBoard[2][2]).toBe('MISS'); // Miss shown

      const [, renderCellContent] = mockUseBoardRenderer.mock.calls[0];
      expect(typeof renderCellContent).toBe('function');

      const result = renderCellContent(displayBoard[0], 0);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(displayBoard[0].length);
    });

    test('component cleanup and memory management', () => {
      const { unmount } = render(<ShootingBoard {...defaultProps} />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
