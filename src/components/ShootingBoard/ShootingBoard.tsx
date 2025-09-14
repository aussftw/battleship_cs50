import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { Cell } from '@/components';
import { Board as BoardType, CellStatus } from '@/types';
import { playerShoot } from '@/features/gameReducer';
import { useBoardRenderer } from '@/hooks';
import { BOARD_SIZE } from '@/constants';

type ShootingBoardProps = {
  targetBoard: BoardType;
  isShooted: boolean;
  onShoot: (shotTaken: boolean) => void;
};

const ShootingBoard: React.FC<ShootingBoardProps> = ({
  targetBoard,
  isShooted,
  onShoot,
}) => {
  const dispatch = useDispatch();

  const handleShoot = useCallback(
    (x: number, y: number) => {
      if (isShooted) return;

      dispatch(playerShoot({ x, y }));
      onShoot(true);
    },
    [isShooted, dispatch, onShoot],
  );

  const preventDefault = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => e.preventDefault(),
    [],
  );

  const cellHandlers = useMemo(() => {
    const handlers: { [key: string]: () => void } = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const key = `${row}-${col}`;
        handlers[key] = () => handleShoot(row, col);
      }
    }
    return handlers;
  }, [handleShoot]);

  const displayBoard = useMemo(() => {
    return targetBoard.map((row) =>
      row.map((cell) => (cell === 'SHIP' ? 'EMPTY' : cell)),
    );
  }, [targetBoard]);

  const renderCellContent = useCallback(
    (row: CellStatus[], rowIndex: number) => {
      return row.map((cell, cellIndex) => (
        <Cell
          key={cellIndex}
          status={cell}
          onClick={cellHandlers[`${rowIndex}-${cellIndex}`]}
          onContextMenu={preventDefault}
        />
      ));
    },
    [cellHandlers, preventDefault],
  );

  const renderedBoard = useBoardRenderer(displayBoard, renderCellContent);

  return <div className="board-grid">{renderedBoard}</div>;
};

export default ShootingBoard;
