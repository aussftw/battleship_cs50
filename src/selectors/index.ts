import { createSelector } from 'reselect';

import { RootState } from '@/store/store';
import { Board, CellStatus, GameStatus, Player, ShipName } from '@/types';
import { Winner } from '@/features/gameReducer';

const isShipPlaced = (cell: CellStatus) => cell === 'SHIP';
const TOTAL_SHIP_CELLS_REQUIRED = 15;

export const allShipsPlacedSelector = (player: 'player1' | 'player2') =>
  createSelector(
    (state: RootState) => state.game[`${player}Board`],
    (playerBoard): boolean => {
      let shipsPlaced = 0;
      for (const row of playerBoard) {
        for (const cell of row) {
          if (isShipPlaced(cell)) {
            shipsPlaced += 1;
          }
        }
      }
      return shipsPlaced === TOTAL_SHIP_CELLS_REQUIRED;
    },
  );

export const player1AllShipsPlacedSelector = createSelector(
  (state: RootState) => state,
  (state) => allShipsPlacedSelector('player1')(state),
);

export const player2AllShipsPlacedSelector = createSelector(
  (state: RootState) => state,
  (state) => allShipsPlacedSelector('player2')(state),
);

const gameStateSelector = (state: RootState) => state.game;
const selectShipStateSelector = (state: RootState) => state.selectShip;

export const shipsSelector = (state: RootState) => state.selectShip.ships;

export const activePlayerSelector = createSelector(
  [gameStateSelector],
  (game): Player => game.activePlayer,
);

export const player1BoardSelector = createSelector(
  [gameStateSelector],
  (game): Board => game.player1Board,
);

export const player2BoardSelector = createSelector(
  [gameStateSelector],
  (game): Board => game.player2Board,
);

export const selectedShipNameSelector = createSelector(
  [selectShipStateSelector],
  (selectShip): ShipName | null => selectShip.selectedShip,
);

export const gameStatusSelector = createSelector(
  [gameStateSelector],
  (game): GameStatus => game.gameStatus,
);

export const winnerSelector = createSelector(
  [gameStateSelector],
  (game): Winner => game.winner,
);
