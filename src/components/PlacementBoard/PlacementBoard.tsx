import React, { useCallback, useMemo } from 'react';

import { Cell } from '@/components';
import { Board as BoardType, CellStatus } from '@/types';
import { useShipPlacement, useBoardRenderer } from '@/hooks';
import { BOARD_SIZE } from '@/constants';

type PlacementBoardProps = {
  initialBoard: BoardType;
  selectedShipName: string | null;
  onBoardUpdate?: (board: BoardType) => void;
};

const PlacementBoard: React.FC<PlacementBoardProps> = ({
  initialBoard,
  selectedShipName,
  onBoardUpdate,
}) => {
  const {
    hoveredCells,
    invalidHoveredCells,
    handleMouseOver,
    handleMouseOut,
    handleRightClick,
    handlePlace,
  } = useShipPlacement(selectedShipName, initialBoard, onBoardUpdate);

  const cellHandlers = useMemo(() => {
    const handlers: {
      [key: string]: {
        onClick: () => void;
        onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
        onMouseOver: () => void;
      };
    } = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const key = `${row}-${col}`;
        handlers[key] = {
          onClick: () => handlePlace(row, col, initialBoard),
          onContextMenu: (e: React.MouseEvent<HTMLDivElement>) =>
            handleRightClick(e, row, col),
          onMouseOver: () => handleMouseOver(row, col),
        };
      }
    }
    return handlers;
  }, [handlePlace, handleRightClick, handleMouseOver, initialBoard]);

  const renderCellContent = useCallback(
    (row: CellStatus[], rowIndex: number) => {
      return row.map((cell, cellIndex) => (
        <Cell
          key={cellIndex}
          status={cell}
          isHovered={hoveredCells.has(`${rowIndex}-${cellIndex}`)}
          onClick={cellHandlers[`${rowIndex}-${cellIndex}`].onClick}
          onContextMenu={cellHandlers[`${rowIndex}-${cellIndex}`].onContextMenu}
          onMouseOver={cellHandlers[`${rowIndex}-${cellIndex}`].onMouseOver}
          isInvalidHover={invalidHoveredCells.has(`${rowIndex}-${cellIndex}`)}
          onMouseOut={handleMouseOut}
        />
      ));
    },
    [cellHandlers, hoveredCells, invalidHoveredCells, handleMouseOut],
  );

  const renderedBoard = useBoardRenderer(initialBoard, renderCellContent);

  return <div className="board-grid">{renderedBoard}</div>;
};

export default PlacementBoard;
