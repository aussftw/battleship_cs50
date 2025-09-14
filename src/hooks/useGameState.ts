import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ShipTemplate } from '@/types';
import {
  selectShip,
  resetShips,
  resetSelectShipState,
} from '@/features/selectShipReducer';
import { setActivePlayer, resetGameState } from '@/features/gameReducer';
import { Player } from '@/types';

export const useGameState = (activePlayer: Player) => {
  const dispatch = useDispatch();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [hasShot, setHasShot] = useState<boolean>(false);

  const handleSelectShip = useCallback(
    (ship: ShipTemplate) => {
      dispatch(selectShip(ship.name));
    },
    [dispatch],
  );

  const handleResetClick = useCallback((): void => {
    setIsOpenModal(false);
    dispatch(resetShips());
  }, [dispatch]);

  const handleModalClose = useCallback((): void => {
    setIsOpenModal(false);
  }, []);

  const handleResetGame = useCallback((): void => {
    dispatch(resetSelectShipState());
    dispatch(resetGameState());
  }, [dispatch]);

  const handlePassTurn = useCallback((): void => {
    setIsOpenModal(true);
    setHasShot(false);
    dispatch(
      setActivePlayer(activePlayer === 'Player1' ? 'Player2' : 'Player1'),
    );
  }, [dispatch, activePlayer]);

  const handleShoot = useCallback((shotTaken: boolean) => {
    setHasShot(shotTaken);
  }, []);

  return {
    isOpenModal,
    hasShot,
    setIsOpenModal,
    handleSelectShip,
    handleResetClick,
    handleModalClose,
    handleResetGame,
    handlePassTurn,
    handleShoot,
  };
};
