import { renderHook } from '@testing-library/react';
import { useBoardRenderer } from '../useBoardRenderer';
import { CellStatus } from '@/types';

describe('useBoardRenderer', () => {
  const createBoard = (size: number = 3): CellStatus[][] =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 'EMPTY' as CellStatus),
    );

  const mockRenderCellContent = jest.fn();

  beforeEach(() => {
    mockRenderCellContent.mockClear();
  });

  describe('Board Structure', () => {
    test('should render and call renderCellContent for 3x3 board', () => {
      const board = createBoard(3);
      mockRenderCellContent.mockReturnValue(['cell1', 'cell2', 'cell3']);

      const { result } = renderHook(() =>
        useBoardRenderer(board, mockRenderCellContent),
      );

      expect(result.current).toBeTruthy();
      expect(mockRenderCellContent).toHaveBeenCalledTimes(3); // 3 rows
    });

    test('should render and call renderCellContent for 10x10 board', () => {
      const board = createBoard(10);
      mockRenderCellContent.mockReturnValue(
        Array.from({ length: 10 }, (_, i) => `cell${i}`),
      );

      const { result } = renderHook(() =>
        useBoardRenderer(board, mockRenderCellContent),
      );

      expect(result.current).toBeTruthy();
      expect(mockRenderCellContent).toHaveBeenCalledTimes(10); // 10 rows
    });

    test('should handle empty board', () => {
      const board: CellStatus[][] = [];

      const { result } = renderHook(() =>
        useBoardRenderer(board, mockRenderCellContent),
      );

      expect(result.current).toBeTruthy();
      expect(mockRenderCellContent).not.toHaveBeenCalled();
    });

    test('should handle board with empty rows', () => {
      const board = [[]];

      const { result } = renderHook(() =>
        useBoardRenderer(board, mockRenderCellContent),
      );

      expect(result.current).toBeTruthy();
      expect(mockRenderCellContent).toHaveBeenCalledWith([], 0);
    });
  });

  describe('Cell Content Rendering', () => {
    test('should call renderCellContent with correct parameters', () => {
      const board: CellStatus[][] = [
        ['EMPTY', 'SHIP'],
        ['HIT', 'MISS'],
      ];
      mockRenderCellContent.mockReturnValue(['cell1', 'cell2']);

      renderHook(() => useBoardRenderer(board, mockRenderCellContent));

      expect(mockRenderCellContent).toHaveBeenCalledWith(['EMPTY', 'SHIP'], 0);
      expect(mockRenderCellContent).toHaveBeenCalledWith(['HIT', 'MISS'], 1);
      expect(mockRenderCellContent).toHaveBeenCalledTimes(2);
    });

    test('should handle different cell statuses', () => {
      const board: CellStatus[][] = [['EMPTY', 'SHIP', 'HIT', 'MISS']];
      mockRenderCellContent.mockReturnValue([
        'cell1',
        'cell2',
        'cell3',
        'cell4',
      ]);

      renderHook(() => useBoardRenderer(board, mockRenderCellContent));

      expect(mockRenderCellContent).toHaveBeenCalledWith(
        ['EMPTY', 'SHIP', 'HIT', 'MISS'],
        0,
      );
    });

    test('should preserve row indices across multiple rows', () => {
      const board = createBoard(5);
      mockRenderCellContent.mockReturnValue(
        Array.from({ length: 5 }, (_, i) => `cell${i}`),
      );

      renderHook(() => useBoardRenderer(board, mockRenderCellContent));

      expect(mockRenderCellContent).toHaveBeenCalledWith(board[0], 0);
      expect(mockRenderCellContent).toHaveBeenCalledWith(board[1], 1);
      expect(mockRenderCellContent).toHaveBeenCalledWith(board[2], 2);
      expect(mockRenderCellContent).toHaveBeenCalledWith(board[3], 3);
      expect(mockRenderCellContent).toHaveBeenCalledWith(board[4], 4);
    });
  });

  describe('Return Value', () => {
    test('should return a React element', () => {
      const board = createBoard(3);
      mockRenderCellContent.mockReturnValue(['cell1', 'cell2', 'cell3']);

      const { result } = renderHook(() =>
        useBoardRenderer(board, mockRenderCellContent),
      );

      expect(result.current).toBeTruthy();
    });

    test('should return consistent result for same inputs', () => {
      const board = createBoard(2);
      mockRenderCellContent.mockReturnValue(['cell1', 'cell2']);

      const { result, rerender } = renderHook(() =>
        useBoardRenderer(board, mockRenderCellContent),
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null renderCellContent gracefully in structure', () => {
      const board = createBoard(2);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() =>
          useBoardRenderer(board, null as unknown as () => React.ReactNode[]),
        );
      }).toThrow(); // Expected to throw since we're calling null as function

      consoleSpy.mockRestore();
    });

    test('should handle irregular board shapes', () => {
      const irregularBoard: CellStatus[][] = [
        ['EMPTY', 'SHIP'],
        ['HIT'],
        ['MISS', 'EMPTY', 'SHIP'],
      ];

      mockRenderCellContent.mockImplementation((row, index) =>
        Array.from({ length: row.length }, (_, i) => `cell${index}-${i}`),
      );

      const { result } = renderHook(() =>
        useBoardRenderer(irregularBoard, mockRenderCellContent),
      );

      expect(result.current).toBeTruthy();
      expect(mockRenderCellContent).toHaveBeenCalledWith(['EMPTY', 'SHIP'], 0);
      expect(mockRenderCellContent).toHaveBeenCalledWith(['HIT'], 1);
      expect(mockRenderCellContent).toHaveBeenCalledWith(
        ['MISS', 'EMPTY', 'SHIP'],
        2,
      );
    });

    test('should handle board updates correctly', () => {
      const board1 = createBoard(2);
      const board2 = createBoard(3);
      mockRenderCellContent.mockReturnValue(['cell']);

      const { rerender } = renderHook(
        ({ board }) => useBoardRenderer(board, mockRenderCellContent),
        { initialProps: { board: board1 } },
      );

      expect(mockRenderCellContent).toHaveBeenCalledTimes(2);

      rerender({ board: board2 });

      expect(mockRenderCellContent).toHaveBeenCalledTimes(2 + 3);
    });
  });
});
