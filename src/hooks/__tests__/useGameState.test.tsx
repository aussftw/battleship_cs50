import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useGameState } from '../useGameState';
import gameReducer from '@/features/gameReducer';
import selectShipReducer from '@/features/selectShipReducer';
import { Player, ShipName } from '@/types';
import { RootState } from '@/store/store';

describe('useGameState', () => {
  let store: ReturnType<typeof configureStore>;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
        selectShip: selectShipReducer,
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  });

  describe('Initial State', () => {
    test('should initialize with correct default values', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      expect(result.current.isOpenModal).toBe(false);
      expect(result.current.hasShot).toBe(false);
    });
  });

  describe('Modal Management', () => {
    test('should open modal when setIsOpenModal is called', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.setIsOpenModal(true);
      });

      expect(result.current.isOpenModal).toBe(true);
    });

    test('should close modal when setIsOpenModal is called', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.setIsOpenModal(true);
      });
      expect(result.current.isOpenModal).toBe(true);

      act(() => {
        result.current.setIsOpenModal(false);
      });
      expect(result.current.isOpenModal).toBe(false);
    });

    test('should close modal on handleModalClose', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.setIsOpenModal(true);
      });

      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.isOpenModal).toBe(false);
    });

    test('should close modal on handleResetClick and dispatch resetShips', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.setIsOpenModal(true);
      });

      act(() => {
        result.current.handleResetClick();
      });

      expect(result.current.isOpenModal).toBe(false);

      const state = store.getState() as RootState;
      expect(
        state.selectShip.ships.every(
          (ship: { isPlaced: boolean }) => !ship.isPlaced,
        ),
      ).toBe(true);
    });
  });

  describe('Shot Management', () => {
    test('should update hasShot state when handleShoot is called', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handleShoot(true);
      });

      expect(result.current.hasShot).toBe(true);

      act(() => {
        result.current.handleShoot(false);
      });

      expect(result.current.hasShot).toBe(false);
    });

    test('should reset hasShot to false on handlePassTurn', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handleShoot(true);
      });
      expect(result.current.hasShot).toBe(true);

      act(() => {
        result.current.handlePassTurn();
      });

      expect(result.current.hasShot).toBe(false);
    });
  });

  describe('Turn Management', () => {
    test('should switch from Player1 to Player2 on handlePassTurn', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handlePassTurn();
      });

      const state = store.getState() as RootState;
      expect(state.game.activePlayer).toBe('Player2');
    });

    test('should switch from Player2 to Player1 on handlePassTurn', () => {
      const { result } = renderHook(() => useGameState('Player2'), { wrapper });

      act(() => {
        result.current.handlePassTurn();
      });

      const state = store.getState() as RootState;
      expect(state.game.activePlayer).toBe('Player1');
    });

    test('should open modal on handlePassTurn', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handlePassTurn();
      });

      expect(result.current.isOpenModal).toBe(true);
    });
  });

  describe('Ship Selection', () => {
    test('should dispatch selectShip action when handleSelectShip is called', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      const mockShip = {
        name: 'Destroyer' as ShipName,
        size: 1,
        isPlaced: false,
      };

      act(() => {
        result.current.handleSelectShip(mockShip);
      });

      const state = store.getState() as RootState;
      expect(state.selectShip.selectedShip).toBe('Destroyer');
    });

    test('should handle ship with null name', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      const mockShip = { name: null, size: 1, isPlaced: false };

      act(() => {
        result.current.handleSelectShip(mockShip);
      });

      const state = store.getState() as RootState;
      expect(state.selectShip.selectedShip).toBeNull();
    });
  });

  describe('Game Reset', () => {
    test('should reset both game and ship state on handleResetGame', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handleSelectShip({
          name: 'Destroyer' as ShipName,
          size: 1,
          isPlaced: false,
        });
        result.current.handleShoot(true);
        result.current.setIsOpenModal(true);
      });

      act(() => {
        result.current.handleResetGame();
      });

      const state = store.getState() as RootState;
      expect(state.game.activePlayer).toBe('Player1');
      expect(state.game.gameStatus).toBe('SettingUp');
      expect(state.game.winner).toBeNull();
      expect(state.selectShip.selectedShip).toBeNull();
      expect(
        state.selectShip.ships.every(
          (ship: { isPlaced: boolean }) => !ship.isPlaced,
        ),
      ).toBe(true);
    });
  });

  describe('Function Stability', () => {
    test('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useGameState('Player1'), {
        wrapper,
      });

      const firstRender = {
        handleSelectShip: result.current.handleSelectShip,
        handleResetClick: result.current.handleResetClick,
        handleModalClose: result.current.handleModalClose,
        handleResetGame: result.current.handleResetGame,
        handlePassTurn: result.current.handlePassTurn,
        handleShoot: result.current.handleShoot,
      };

      rerender();

      const secondRender = {
        handleSelectShip: result.current.handleSelectShip,
        handleResetClick: result.current.handleResetClick,
        handleModalClose: result.current.handleModalClose,
        handleResetGame: result.current.handleResetGame,
        handlePassTurn: result.current.handlePassTurn,
        handleShoot: result.current.handleShoot,
      };

      expect(firstRender.handleSelectShip).toBe(secondRender.handleSelectShip);
      expect(firstRender.handleResetClick).toBe(secondRender.handleResetClick);
      expect(firstRender.handleModalClose).toBe(secondRender.handleModalClose);
      expect(firstRender.handleResetGame).toBe(secondRender.handleResetGame);
      expect(firstRender.handleShoot).toBe(secondRender.handleShoot);
    });

    test('should update handlePassTurn when activePlayer changes', () => {
      const { result, rerender } = renderHook(
        ({ activePlayer }) => useGameState(activePlayer as Player),
        {
          wrapper,
          initialProps: { activePlayer: 'Player1' },
        },
      );

      const firstRender = result.current.handlePassTurn;

      rerender({ activePlayer: 'Player2' });

      const secondRender = result.current.handlePassTurn;

      expect(firstRender).not.toBe(secondRender);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete turn cycle', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handleShoot(true);
      });
      expect(result.current.hasShot).toBe(true);

      act(() => {
        result.current.handlePassTurn();
      });
      expect(result.current.hasShot).toBe(false);
      expect(result.current.isOpenModal).toBe(true);

      act(() => {
        result.current.handleModalClose();
      });
      expect(result.current.isOpenModal).toBe(false);

      const state = store.getState() as RootState;
      expect(state.game.activePlayer).toBe('Player2');
    });

    test('should handle setup phase completion', () => {
      const { result } = renderHook(() => useGameState('Player1'), { wrapper });

      act(() => {
        result.current.handleSelectShip({
          name: 'Destroyer' as ShipName,
          size: 1,
          isPlaced: false,
        });
      });

      act(() => {
        result.current.handleResetClick();
      });

      expect(result.current.isOpenModal).toBe(false);
      const state = store.getState() as RootState;
      expect(
        state.selectShip.ships.every(
          (ship: { isPlaced: boolean }) => !ship.isPlaced,
        ),
      ).toBe(true);
    });
  });
});
