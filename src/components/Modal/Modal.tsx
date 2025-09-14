import { useCallback } from 'react';
import { GameStatus, Player } from '@/types';

type ModalProps = {
  isOpenModal: boolean;
  gameStatus: GameStatus;
  activePlayer: Player;
  handleResetClick: () => void;
  handleModalClose: () => void;
  handleResetGame: () => void;
};

const GameModal: React.FC<ModalProps> = ({
  isOpenModal,
  gameStatus,
  activePlayer,
  handleResetClick,
  handleModalClose,
  handleResetGame,
}) => {
  const getMessage = () => {
    switch (gameStatus) {
      case 'SettingUp':
        return "Now it's Player 2's turn.";
      case 'InPlay':
        return `Now it's ${
          activePlayer === 'Player1' ? 'Player 1' : 'Player 2'
        }'s turn. Ready?`;
      case 'Ended':
        return `The winner is ${
          activePlayer === 'Player1' ? 'Player 1' : 'Player 2'
        } Play again?`;
      default:
        return '';
    }
  };

  const handleClick = useCallback(() => {
    switch (gameStatus) {
      case 'SettingUp':
        handleResetClick();
        break;
      case 'InPlay':
        handleModalClose();
        break;
      case 'Ended':
        handleResetGame();
        break;
      default:
        console.log('Unhandled gameStatus: ', gameStatus);
    }
  }, [gameStatus, handleResetClick, handleModalClose, handleResetGame]);

  const getButtonText = () => {
    switch (gameStatus) {
      case 'SettingUp':
        return 'Ok';
      case 'InPlay':
        return 'Yes';
      case 'Ended':
        return 'Yes';
      default:
        return '';
    }
  };

  if (!isOpenModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-xl z-50">
      <div className="bg-white p-12 rounded shadow-lg flex flex-col items-center justify-center">
        <p className="m-8">{getMessage()}</p>
        <button
          onClick={handleClick}
          className="bg-red-600 text-white px-10 py-2 rounded hover:bg-red-700 transition duration-200"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default GameModal;
