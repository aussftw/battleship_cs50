import { clsx } from 'clsx';
import { CellStatus } from '@/types';

export type CellProps = {
  status: CellStatus;
  onClick?: () => void;
  className?: string;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  isHovered?: boolean;
  isInvalidHover?: boolean;
};

const Cell: React.FC<CellProps> = ({
  status,
  onClick,
  className,
  onContextMenu,
  onMouseOver,
  onMouseOut,
  isHovered,
  isInvalidHover,
}) => {
  const cellClassName = clsx(
    'cell',
    {
      'cell--empty': status === 'EMPTY',
      'cell--ship': status === 'SHIP',
      'cell--hit': status === 'HIT',
      'cell--miss': status === 'MISS',
      'cell--hovered': isHovered,
      'cell--invalid-hover': isInvalidHover,
    },
    className,
  );

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      className={cellClassName}
    ></div>
  );
};

export default Cell;
