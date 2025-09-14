import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clsx } from 'clsx';

import { initializeBoard } from '@/helpers';
import {
  PlacementBoard,
  ShootingBoard,
  PlayerBoard,
  ShipSelection,
  GameModal,
} from '@/components';
import { setActivePlayer, setGameStatus } from '@/features/gameReducer';
import { useReduxSelectors, useGameState } from '@/hooks';

export const Game: React.FC = () => {
  const dispatch = useDispatch();
  const {
    ships,
    selectedShipName,
    gameStatus,
    activePlayer,
    winner,
    player1Board,
    player2Board,
    player1AllShipsPlaced,
    player2AllShipsPlaced,
  } = useReduxSelectors();

  const {
    isOpenModal,
    hasShot,
    setIsOpenModal,
    handleSelectShip,
    handleResetClick,
    handleModalClose,
    handleResetGame,
    handlePassTurn,
    handleShoot,
  } = useGameState(activePlayer);

  // Transition to Player 2 setup after Player 1 completes ship placement
  useEffect(() => {
    if (player1AllShipsPlaced) {
      dispatch(setActivePlayer('Player2'));
      setIsOpenModal(true);
    }
    if (player2AllShipsPlaced && gameStatus === 'SettingUp') {
      dispatch(setActivePlayer('Player1'));
    }
  }, [player1AllShipsPlaced, player2AllShipsPlaced, gameStatus, dispatch]);

  useEffect(() => {
    if (player2AllShipsPlaced && gameStatus === 'SettingUp') {
      dispatch(setGameStatus('InPlay'));
      dispatch(setActivePlayer('Player1'));
    }
  }, [gameStatus, player2AllShipsPlaced, dispatch]);

  useEffect(() => {
    if (winner) {
      setIsOpenModal(true);
    }
  }, [winner, setIsOpenModal]);

  const renderInPlay = () => {
    if (gameStatus !== 'InPlay') return null;

    return (
      <>
        <div className="game-boards">
          <div className="board-section">
            <h3 className="board-title">Your Board</h3>
            <PlayerBoard
              board={activePlayer === 'Player1' ? player1Board : player2Board}
            />
          </div>

          <div className="board-section">
            <h3 className="board-title">Enemy's Board</h3>
            <ShootingBoard
              targetBoard={
                activePlayer === 'Player1' ? player2Board : player1Board
              }
              isShooted={hasShot}
              onShoot={handleShoot}
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-6">
          <button
            onClick={handlePassTurn}
            className={clsx('btn btn--danger', {
              'opacity-50 cursor-not-allowed': !hasShot,
            })}
            disabled={!hasShot}
          >
            Finish turn
          </button>
        </div>
      </>
    );
  };

  const renderShipSelection = () => {
    if (gameStatus !== 'SettingUp') return null;

    return (
      <>
        <ShipSelection
          ships={ships}
          selectedShipName={selectedShipName}
          onSelectShip={handleSelectShip}
        />

        <div className="flex justify-center items-center h-screen">
          <PlacementBoard
            initialBoard={
              activePlayer === 'Player1'
                ? player1Board.length > 0
                  ? player1Board
                  : initializeBoard()
                : player2Board.length > 0
                  ? player2Board
                  : initializeBoard()
            }
            selectedShipName={selectedShipName}
          />
        </div>
      </>
    );
  };

  const renderModal = () => {
    if (!isOpenModal) return null;

    return (
      <GameModal
        isOpenModal={isOpenModal}
        gameStatus={gameStatus}
        activePlayer={activePlayer}
        handleResetClick={handleResetClick}
        handleModalClose={handleModalClose}
        handleResetGame={handleResetGame}
      />
    );
  };

  return (
    <>
      {renderShipSelection()}
      {renderModal()}
      {renderInPlay()}
    </>
  );
};
