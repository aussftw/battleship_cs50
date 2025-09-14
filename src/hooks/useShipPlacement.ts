import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { placeShip as placeShipHelper } from '@/helpers';
import { Board as BoardType, PlacedShip as PlacedShipType } from '@/types';
import { placeShip } from '@/features/selectShipReducer';
import { setPlayerBoard } from '@/features/gameReducer';
import { SHIP_SIZES } from '@/constants';

export const useShipPlacement = (
  selectedShipName: string | null,
  board: BoardType,
  onBoardUpdate?: (board: BoardType) => void,
) => {
  const dispatch = useDispatch();
  const [hoveredCells, setHoveredCells] = useState<Set<string>>(new Set());
  const [invalidHoveredCells, setInvalidHoveredCells] = useState<Set<string>>(
    new Set(),
  );
  const [shipDirection, setShipDirection] = useState<'HORIZONTAL' | 'VERTICAL'>(
    'HORIZONTAL',
  );

  const currentShip = useMemo((): PlacedShipType | null => {
    if (!selectedShipName || !(selectedShipName in SHIP_SIZES)) return null;

    const size = SHIP_SIZES[selectedShipName as keyof typeof SHIP_SIZES];
    return {
      x: 0,
      y: 0,
      length: size,
      direction: 'HORIZONTAL',
    };
  }, [selectedShipName]);

  // Reset ship orientation when a new ship is selected
  useEffect(() => {
    setShipDirection('HORIZONTAL');
  }, [selectedShipName]);

  // Calculates which cells a ship would occupy if placed at the given position
  const computePotentialShipCells = useCallback(
    (x: number, y: number): { x: number; y: number }[] => {
      if (!currentShip) return [];

      const shipCells: { x: number; y: number }[] = [];
      const { length } = currentShip;

      if (shipDirection === 'HORIZONTAL') {
        for (let i = 0; i < length; i++) {
          if (
            y + i < board[x]?.length &&
            (board[x][y + i] === 'EMPTY' || board[x][y + i] === 'SHIP')
          ) {
            shipCells.push({ x, y: y + i });
          }
        }
      } else {
        for (let i = 0; i < length; i++) {
          if (
            x + i < board.length &&
            board[x + i] &&
            (board[x + i][y] === 'EMPTY' || board[x + i][y] === 'SHIP')
          ) {
            shipCells.push({ x: x + i, y });
          }
        }
      }

      return shipCells;
    },
    [currentShip, shipDirection, board],
  );

  const handleMouseOver = useCallback(
    (x: number, y: number) => {
      if (!currentShip) return;

      const shipCells = computePotentialShipCells(x, y);
      const isInvalidPlacement =
        shipCells.some((cell) => board[cell.x][cell.y] === 'SHIP') ||
        shipCells.length !== currentShip.length; // Ship doesn't fit in bounds

      // Show visual feedback: green for valid placement, red for invalid
      if (!isInvalidPlacement) {
        setHoveredCells(
          new Set(shipCells.map((cell) => `${cell.x}-${cell.y}`)),
        );
        setInvalidHoveredCells(new Set());
      } else {
        setInvalidHoveredCells(
          new Set(shipCells.map((cell) => `${cell.x}-${cell.y}`)),
        );
        setHoveredCells(new Set());
      }
    },
    [currentShip, computePotentialShipCells, board],
  );

  const handleMouseOut = useCallback(() => {
    setHoveredCells(new Set());
    setInvalidHoveredCells(new Set());
  }, []);

  const handleRightClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, x: number, y: number) => {
      e.preventDefault();
      if (!currentShip) return;

      setShipDirection((prev) =>
        prev === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL',
      );
      // Re-trigger hover calculation with new direction
      handleMouseOver(x, y);
    },
    [currentShip, handleMouseOver],
  );

  const handlePlace = useCallback(
    (x: number, y: number, boardState: BoardType) => {
      if (!currentShip || !selectedShipName) return boardState;

      const shipToPlace = { ...currentShip, direction: shipDirection };
      const newBoard = placeShipHelper(boardState, x, y, shipToPlace);

      if (newBoard === boardState) return boardState; // Placement failed

      dispatch(placeShip(selectedShipName));
      dispatch(setPlayerBoard(newBoard));
      onBoardUpdate?.(newBoard);

      return newBoard;
    },
    [currentShip, selectedShipName, shipDirection, dispatch, onBoardUpdate],
  );

  return {
    currentShip,
    shipDirection,
    hoveredCells,
    invalidHoveredCells,
    handleMouseOver,
    handleMouseOut,
    handleRightClick,
    handlePlace,
  };
};
