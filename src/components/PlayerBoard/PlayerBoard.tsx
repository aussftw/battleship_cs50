import { Cell } from '@/components';
import { Board as BoardType, CellStatus } from '@/types';
import { useBoardRenderer } from '@/hooks';

type PlayerBoardProps = {
  board: BoardType;
};

const PlayerBoard: React.FC<PlayerBoardProps> = ({ board }) => {
  const renderCellContent = (row: CellStatus[]) => {
    return row.map((cell, cellIndex) => <Cell key={cellIndex} status={cell} />);
  };

  const renderedBoard = useBoardRenderer(board, renderCellContent);

  return <div className="board-grid">{renderedBoard}</div>;
};

export default PlayerBoard;
