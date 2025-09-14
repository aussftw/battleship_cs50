import { useSelector } from 'react-redux';

import { GameStatus, Player, ShipName, Board as BoardType } from '@/types';
import { Winner } from '@/features/gameReducer';
import {
  selectedShipNameSelector,
  player1BoardSelector,
  player2BoardSelector,
  gameStatusSelector,
  activePlayerSelector,
  player1AllShipsPlacedSelector,
  player2AllShipsPlacedSelector,
  shipsSelector,
  winnerSelector,
} from '@/selectors';

export const useReduxSelectors = () => {
  const ships = useSelector(shipsSelector);
  const selectedShipName = useSelector(
    selectedShipNameSelector,
  ) as ShipName | null;
  const gameStatus = useSelector(gameStatusSelector) as GameStatus;
  const activePlayer = useSelector(activePlayerSelector) as Player;
  const winner = useSelector(winnerSelector) as Winner;

  const player1Board = useSelector(player1BoardSelector) as BoardType;
  const player2Board = useSelector(player2BoardSelector) as BoardType;

  const player1AllShipsPlaced = useSelector(
    player1AllShipsPlacedSelector,
  ) as boolean;
  const player2AllShipsPlaced = useSelector(
    player2AllShipsPlacedSelector,
  ) as boolean;

  return {
    ships,
    selectedShipName,
    gameStatus,
    activePlayer,
    winner,
    player1Board,
    player2Board,
    player1AllShipsPlaced,
    player2AllShipsPlaced,
  };
};
