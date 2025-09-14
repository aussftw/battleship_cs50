import React, { useMemo } from 'react';
import { Board as BoardType, CellStatus } from '@/types';

export const useBoardRenderer = (
  board: BoardType,
  renderCellContent: (row: CellStatus[], rowIndex: number) => React.ReactNode[],
) => {
  const renderedBoard = useMemo(() => {
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '20px' }} />
          {board[0]?.map((_, index) => (
            <div key={index} style={{ width: '33px', textAlign: 'center' }}>
              {index + 1}
            </div>
          ))}
        </div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            <div style={{ width: '33px', textAlign: 'center' }}>
              {String.fromCharCode(65 + rowIndex)}
            </div>
            {renderCellContent(row, rowIndex)}
          </div>
        ))}
      </div>
    );
  }, [board, renderCellContent]);

  return renderedBoard;
};
