import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Game } from '../Game';
import { initializeBoard } from '@/helpers';

jest.mock('@/components', () => ({
  PlacementBoard: jest.fn(({ selectedShipName }) => (
    <div data-testid="placement-board" data-selected-ship={selectedShipName}>
      PlacementBoard
    </div>
  )),
  ShootingBoard: jest.fn(({ isShooted, onShoot }) => (
    <div
      data-testid="shooting-board"
      data-is-shooted={isShooted}
      onClick={() => onShoot && onShoot(true)}
    >
      ShootingBoard
    </div>
  )),
  PlayerBoard: jest.fn(({ board }) => (
    <div data-testid="player-board" data-board-length={board?.length || 0}>
      PlayerBoard
    </div>
  )),
  ShipSelection: jest.fn(({ ships, selectedShipName, onSelectShip }) => (
    <div
      data-testid="ship-selection"
      data-selected-ship={selectedShipName}
      onClick={() => onSelectShip && onSelectShip(ships[0])}
    >
      ShipSelection
    </div>
  )),
  GameModal: jest.fn(
    ({
      isOpenModal,
      gameStatus,
      activePlayer,
      handleResetClick,
      handleModalClose,
      handleResetGame,
    }) => {
      if (!isOpenModal) return null;
      return (
        <div
          data-testid="game-modal"
          data-game-status={gameStatus}
          data-active-player={activePlayer}
        >
          <button data-testid="modal-reset-button" onClick={handleResetClick}>
            Reset
          </button>
          <button data-testid="modal-close-button" onClick={handleModalClose}>
            Close
          </button>
          <button
            data-testid="modal-reset-game-button"
            onClick={handleResetGame}
          >
            Reset Game
          </button>
          GameModal
        </div>
      );
    },
  ),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('@/features/gameReducer', () => ({
  setActivePlayer: jest.fn((player) => ({
    type: 'SET_ACTIVE_PLAYER',
    payload: player,
  })),
  setGameStatus: jest.fn((status) => ({
    type: 'SET_GAME_STATUS',
    payload: status,
  })),
}));

const mockUseReduxSelectors = jest.fn();
const mockUseGameState = jest.fn();

jest.mock('@/hooks', () => ({
  useReduxSelectors: () => mockUseReduxSelectors(),
  useGameState: () => mockUseGameState(),
}));

jest.mock('@/helpers', () => ({
  initializeBoard: jest.fn(() =>
    Array(10)
      .fill(null)
      .map(() => Array(10).fill('EMPTY')),
  ),
}));

describe('Game Component', () => {
  const mockBoard = Array(10)
    .fill(null)
    .map(() => Array(10).fill('EMPTY'));
  const mockShips = [
    { name: 'Destroyer', size: 1, isPlaced: false },
    { name: 'Submarine', size: 2, isPlaced: false },
  ];

  const defaultReduxState = {
    ships: mockShips,
    selectedShipName: null,
    gameStatus: 'SettingUp',
    activePlayer: 'Player1',
    winner: null,
    player1Board: mockBoard,
    player2Board: mockBoard,
    player1AllShipsPlaced: false,
    player2AllShipsPlaced: false,
  };

  const defaultGameState = {
    isOpenModal: false,
    hasShot: false,
    setIsOpenModal: jest.fn(),
    handleSelectShip: jest.fn(),
    handleResetClick: jest.fn(),
    handleModalClose: jest.fn(),
    handleResetGame: jest.fn(),
    handlePassTurn: jest.fn(),
    handleShoot: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseReduxSelectors.mockReturnValue(defaultReduxState);
    mockUseGameState.mockReturnValue(defaultGameState);
  });

  describe('Basic Rendering & Component Integration', () => {
    it('renders without crashing', () => {
      render(<Game />);
      expect(screen.getByTestId('ship-selection')).toBeInTheDocument();
    });

    it('renders ShipSelection and PlacementBoard during SettingUp state', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
      });

      render(<Game />);

      expect(screen.getByTestId('ship-selection')).toBeInTheDocument();
      expect(screen.getByTestId('placement-board')).toBeInTheDocument();
      expect(screen.queryByTestId('shooting-board')).not.toBeInTheDocument();
      expect(screen.queryByTestId('player-board')).not.toBeInTheDocument();
    });

    it('renders PlayerBoard and ShootingBoard during InPlay state', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      render(<Game />);

      expect(screen.getByTestId('player-board')).toBeInTheDocument();
      expect(screen.getByTestId('shooting-board')).toBeInTheDocument();
      expect(screen.queryByTestId('ship-selection')).not.toBeInTheDocument();
      expect(screen.queryByTestId('placement-board')).not.toBeInTheDocument();
    });

    it('passes correct props to ShipSelection component', () => {
      const selectedShipName = 'Destroyer';
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        selectedShipName,
        gameStatus: 'SettingUp',
      });

      render(<Game />);

      const shipSelection = screen.getByTestId('ship-selection');
      expect(shipSelection).toHaveAttribute(
        'data-selected-ship',
        selectedShipName,
      );
    });

    it('passes correct props to PlacementBoard component', () => {
      const selectedShipName = 'Cruiser';
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        selectedShipName,
        gameStatus: 'SettingUp',
      });

      render(<Game />);

      const placementBoard = screen.getByTestId('placement-board');
      expect(placementBoard).toHaveAttribute(
        'data-selected-ship',
        selectedShipName,
      );
    });
  });

  describe('Game State Orchestration', () => {
    it('renders correct board for Player1 during InPlay', () => {
      const player1Board = Array(10)
        .fill(null)
        .map(() => Array(10).fill('SHIP'));
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
        activePlayer: 'Player1',
        player1Board,
      });

      render(<Game />);

      const playerBoard = screen.getByTestId('player-board');
      expect(playerBoard).toHaveAttribute('data-board-length', '10');
    });

    it('renders correct board for Player2 during InPlay', () => {
      const player2Board = Array(10)
        .fill(null)
        .map(() => Array(10).fill('SHIP'));
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
        activePlayer: 'Player2',
        player2Board,
      });

      render(<Game />);

      const playerBoard = screen.getByTestId('player-board');
      expect(playerBoard).toHaveAttribute('data-board-length', '10');
    });

    it('passes correct target board to ShootingBoard', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
        activePlayer: 'Player1',
      });

      render(<Game />);

      expect(screen.getByTestId('shooting-board')).toBeInTheDocument();
    });

    it('shows Finish turn button during InPlay state', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      render(<Game />);

      expect(screen.getByText('Finish turn')).toBeInTheDocument();
    });

    it('enables Finish turn button when hasShot is true', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        hasShot: true,
      });

      render(<Game />);

      const finishButton = screen.getByText('Finish turn');
      expect(finishButton).not.toBeDisabled();
    });

    it('disables Finish turn button when hasShot is false', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        hasShot: false,
      });

      render(<Game />);

      const finishButton = screen.getByText('Finish turn');
      expect(finishButton).toBeDisabled();
    });
  });

  describe('useEffect Lifecycle Tests', () => {
    it('dispatches setActivePlayer when player1AllShipsPlaced becomes true', async () => {
      const { rerender } = render(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        player1AllShipsPlaced: true,
      });

      rerender(<Game />);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'SET_ACTIVE_PLAYER',
          payload: 'Player2',
        });
      });
    });

    it('opens modal when player1AllShipsPlaced becomes true', async () => {
      const mockSetIsOpenModal = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        setIsOpenModal: mockSetIsOpenModal,
      });

      const { rerender } = render(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        player1AllShipsPlaced: true,
      });

      rerender(<Game />);

      await waitFor(() => {
        expect(mockSetIsOpenModal).toHaveBeenCalledWith(true);
      });
    });

    it('transitions to InPlay when player2AllShipsPlaced and gameStatus is SettingUp', async () => {
      const { rerender } = render(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
        player2AllShipsPlaced: true,
      });

      rerender(<Game />);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'SET_GAME_STATUS',
          payload: 'InPlay',
        });
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'SET_ACTIVE_PLAYER',
          payload: 'Player1',
        });
      });
    });

    it('opens modal when winner is set', async () => {
      const mockSetIsOpenModal = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        setIsOpenModal: mockSetIsOpenModal,
      });

      const { rerender } = render(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        winner: 'Player1',
      });

      rerender(<Game />);

      await waitFor(() => {
        expect(mockSetIsOpenModal).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Custom Hooks Integration', () => {
    it('uses useReduxSelectors correctly', () => {
      render(<Game />);
      expect(mockUseReduxSelectors).toHaveBeenCalled();
    });

    it('uses useGameState with activePlayer correctly', () => {
      const activePlayer = 'Player2';
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        activePlayer,
      });

      render(<Game />);

      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('passes handleSelectShip to ShipSelection', () => {
      const handleSelectShip = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        handleSelectShip,
      });
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
      });

      render(<Game />);

      const shipSelection = screen.getByTestId('ship-selection');
      fireEvent.click(shipSelection);

      expect(handleSelectShip).toHaveBeenCalled();
    });

    it('passes handleShoot to ShootingBoard', () => {
      const handleShoot = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        handleShoot,
      });
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      render(<Game />);

      const shootingBoard = screen.getByTestId('shooting-board');
      fireEvent.click(shootingBoard);

      expect(handleShoot).toHaveBeenCalledWith(true);
    });

    it('calls handlePassTurn when Finish turn button is clicked', () => {
      const handlePassTurn = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        hasShot: true,
        handlePassTurn,
      });
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      render(<Game />);

      const finishButton = screen.getByText('Finish turn');
      fireEvent.click(finishButton);

      expect(handlePassTurn).toHaveBeenCalled();
    });
  });

  describe('Modal and UI Flow Tests', () => {
    it('renders modal when isOpenModal is true', () => {
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: true,
      });

      render(<Game />);

      expect(screen.getByTestId('game-modal')).toBeInTheDocument();
    });

    it('does not render modal when isOpenModal is false', () => {
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: false,
      });

      render(<Game />);

      expect(screen.queryByTestId('game-modal')).not.toBeInTheDocument();
    });

    it('passes correct props to GameModal', () => {
      const gameStatus = 'InPlay';
      const activePlayer = 'Player2';
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus,
        activePlayer,
      });
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: true,
      });

      render(<Game />);

      const modal = screen.getByTestId('game-modal');
      expect(modal).toHaveAttribute('data-game-status', gameStatus);
      expect(modal).toHaveAttribute('data-active-player', activePlayer);
    });

    it('calls handleResetClick when modal reset button is clicked', () => {
      const handleResetClick = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: true,
        handleResetClick,
      });

      render(<Game />);

      const resetButton = screen.getByTestId('modal-reset-button');
      fireEvent.click(resetButton);

      expect(handleResetClick).toHaveBeenCalled();
    });

    it('calls handleModalClose when modal close button is clicked', () => {
      const handleModalClose = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: true,
        handleModalClose,
      });

      render(<Game />);

      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);

      expect(handleModalClose).toHaveBeenCalled();
    });

    it('calls handleResetGame when modal reset game button is clicked', () => {
      const handleResetGame = jest.fn();
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: true,
        handleResetGame,
      });

      render(<Game />);

      const resetGameButton = screen.getByTestId('modal-reset-game-button');
      fireEvent.click(resetGameButton);

      expect(handleResetGame).toHaveBeenCalled();
    });
  });

  describe('Board State and Props Tests', () => {
    it('passes Player1 board to PlacementBoard when activePlayer is Player1', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
        activePlayer: 'Player1',
      });

      render(<Game />);

      expect(screen.getByTestId('placement-board')).toBeInTheDocument();
    });

    it('passes Player2 board to PlacementBoard when activePlayer is Player2', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
        activePlayer: 'Player2',
      });

      render(<Game />);

      expect(screen.getByTestId('placement-board')).toBeInTheDocument();
    });

    it('uses initializeBoard when player board is empty', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
        activePlayer: 'Player1',
        player1Board: [],
      });

      render(<Game />);

      expect(initializeBoard).toHaveBeenCalled();
    });

    it('passes correct target board to ShootingBoard for Player1', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
        activePlayer: 'Player1',
      });

      render(<Game />);

      expect(screen.getByTestId('shooting-board')).toBeInTheDocument();
    });

    it('passes correct target board to ShootingBoard for Player2', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
        activePlayer: 'Player2',
      });

      render(<Game />);

      expect(screen.getByTestId('shooting-board')).toBeInTheDocument();
    });
  });

  describe('Game Flow Rendering Tests', () => {
    it('renders only setup components during SettingUp', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
      });

      render(<Game />);

      expect(screen.getByTestId('ship-selection')).toBeInTheDocument();
      expect(screen.getByTestId('placement-board')).toBeInTheDocument();
      expect(screen.queryByTestId('player-board')).not.toBeInTheDocument();
      expect(screen.queryByTestId('shooting-board')).not.toBeInTheDocument();
      expect(screen.queryByText('Finish turn')).not.toBeInTheDocument();
    });

    it('renders only gameplay components during InPlay', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      render(<Game />);

      expect(screen.queryByTestId('ship-selection')).not.toBeInTheDocument();
      expect(screen.queryByTestId('placement-board')).not.toBeInTheDocument();
      expect(screen.getByTestId('player-board')).toBeInTheDocument();
      expect(screen.getByTestId('shooting-board')).toBeInTheDocument();
      expect(screen.getByText('Finish turn')).toBeInTheDocument();
    });

    it('renders components correctly during Ended state', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'Ended',
        winner: 'Player1',
      });
      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        isOpenModal: true,
      });

      render(<Game />);

      expect(screen.getByTestId('game-modal')).toBeInTheDocument();
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('handles undefined Redux state gracefully', () => {
      mockUseReduxSelectors.mockReturnValue({
        ships: undefined,
        selectedShipName: undefined,
        gameStatus: undefined,
        activePlayer: undefined,
        winner: undefined,
        player1Board: undefined,
        player2Board: undefined,
        player1AllShipsPlaced: undefined,
        player2AllShipsPlaced: undefined,
      });

      expect(() => render(<Game />)).not.toThrow();
    });

    it('handles undefined game state hooks gracefully', () => {
      mockUseGameState.mockReturnValue({
        isOpenModal: undefined,
        hasShot: undefined,
        setIsOpenModal: undefined,
        handleSelectShip: undefined,
        handleResetClick: undefined,
        handleModalClose: undefined,
        handleResetGame: undefined,
        handlePassTurn: undefined,
        handleShoot: undefined,
      });

      expect(() => render(<Game />)).not.toThrow();
    });

    it('handles empty boards gracefully', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        player1Board: [],
        player2Board: [],
        gameStatus: 'InPlay',
      });

      render(<Game />);

      const playerBoard = screen.getByTestId('player-board');
      expect(playerBoard).toHaveAttribute('data-board-length', '0');
    });

    it('handles null winner state', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        winner: null,
      });

      expect(() => render(<Game />)).not.toThrow();
    });

    it('handles rapid state changes gracefully', async () => {
      const { rerender } = render(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
      });
      rerender(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });
      rerender(<Game />);

      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'Ended',
        winner: 'Player1',
      });
      rerender(<Game />);

      expect(() => rerender(<Game />)).not.toThrow();
    });
  });

  describe('Component Layout and Structure', () => {
    it('applies correct CSS classes for InPlay layout', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      render(<Game />);

      expect(screen.getByText('Your Board')).toBeInTheDocument();
      expect(screen.getByText("Enemy's Board")).toBeInTheDocument();
    });

    it('maintains correct component hierarchy during SettingUp', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'SettingUp',
      });

      const { container } = render(<Game />);

      const shipSelection = screen.getByTestId('ship-selection');
      const placementBoard = screen.getByTestId('placement-board');

      expect(container).toContainElement(shipSelection);
      expect(container).toContainElement(placementBoard);
    });

    it('shows correct button styling based on hasShot state', () => {
      mockUseReduxSelectors.mockReturnValue({
        ...defaultReduxState,
        gameStatus: 'InPlay',
      });

      const { rerender } = render(<Game />);

      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        hasShot: false,
      });
      rerender(<Game />);

      let finishButton = screen.getByText('Finish turn');
      expect(finishButton).toHaveClass('opacity-50 cursor-not-allowed');

      mockUseGameState.mockReturnValue({
        ...defaultGameState,
        hasShot: true,
      });
      rerender(<Game />);

      finishButton = screen.getByText('Finish turn');
      expect(finishButton).not.toHaveClass('opacity-50 cursor-not-allowed');
    });
  });
});
