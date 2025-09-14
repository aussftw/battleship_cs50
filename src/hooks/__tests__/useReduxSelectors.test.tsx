import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useReduxSelectors } from '../useReduxSelectors';
import gameReducer, {
  setActivePlayer,
  setGameStatus,
  setWinner,
  setPlayerBoard,
  resetGameState,
} from '@/features/gameReducer';
import selectShipReducer, {
  selectShip,
  placeShip,
  resetSelectShipState,
} from '@/features/selectShipReducer';
import { initializeBoard } from '@/helpers';
import { ShipName } from '@/types';

describe('useReduxSelectors', () => {
  let store: ReturnType<typeof configureStore>;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
        selectShip: selectShipReducer,
      },
    });

    const player1Board = initializeBoard();
    const player2Board = initializeBoard();

    store.dispatch(setPlayerBoard(player1Board));

    store.dispatch(setActivePlayer('Player2'));
    store.dispatch(setPlayerBoard(player2Board));

    store.dispatch(setActivePlayer('Player1'));

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  });

  describe('Selector Values', () => {
    test('should return all selector values from initial state', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current).toEqual({
        ships: expect.any(Array),
        selectedShipName: null,
        gameStatus: 'SettingUp',
        activePlayer: 'Player1',
        winner: null,
        player1Board: expect.any(Array),
        player2Board: expect.any(Array),
        player1AllShipsPlaced: false,
        player2AllShipsPlaced: false,
      });
    });

    test('should return correct ship data', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.ships).toHaveLength(5); // All 5 ships
      expect(result.current.ships[0]).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          size: expect.any(Number),
          isPlaced: expect.any(Boolean),
        }),
      );
    });

    test('should return correct board dimensions', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.player1Board).toHaveLength(10); // 10 rows
      expect(result.current.player1Board[0]).toHaveLength(10); // 10 columns
      expect(result.current.player2Board).toHaveLength(10);
      expect(result.current.player2Board[0]).toHaveLength(10);
    });
  });

  describe('Type Safety', () => {
    test('should return correctly typed game status values', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.gameStatus).toMatch(/^(SettingUp|InPlay|Ended)$/);
      expect(result.current.activePlayer).toMatch(/^(Player1|Player2)$/);
    });

    test('should handle null selected ship name', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.selectedShipName).toBeNull();
    });

    test('should handle null winner', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.winner).toBeNull();
    });
  });

  describe('State Updates', () => {
    test('should reflect state changes when activePlayer updates', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.activePlayer).toBe('Player1');

      act(() => {
        store.dispatch(setActivePlayer('Player2'));
      });

      expect(result.current.activePlayer).toBe('Player2');
    });

    test('should reflect state changes when gameStatus updates', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.gameStatus).toBe('SettingUp');

      act(() => {
        store.dispatch(setGameStatus('InPlay'));
      });

      expect(result.current.gameStatus).toBe('InPlay');
    });

    test('should reflect state changes when selectedShip updates', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.selectedShipName).toBeNull();

      act(() => {
        store.dispatch(selectShip('Destroyer'));
      });

      expect(result.current.selectedShipName).toBe('Destroyer');
    });

    test('should reflect state changes when winner is set', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.winner).toBeNull();

      act(() => {
        store.dispatch(setWinner('Player1'));
      });

      expect(result.current.winner).toBe('Player1');
    });
  });

  describe('Ship Placement Status', () => {
    test('should return false for all ships placed when no ships are placed', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.player1AllShipsPlaced).toBe(false);
      expect(result.current.player2AllShipsPlaced).toBe(false);
    });

    test('should update when ships are placed', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      act(() => {
        store.dispatch(placeShip('Destroyer'));
      });

      expect(
        result.current.ships.find((ship) => ship.name === 'Destroyer')
          ?.isPlaced,
      ).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should return stable references for unchanged values', () => {
      const { result, rerender } = renderHook(() => useReduxSelectors(), {
        wrapper,
      });

      const firstRender = {
        ships: result.current.ships,
        player1Board: result.current.player1Board,
        player2Board: result.current.player2Board,
      };

      rerender();

      const secondRender = {
        ships: result.current.ships,
        player1Board: result.current.player1Board,
        player2Board: result.current.player2Board,
      };

      expect(firstRender.ships).toBe(secondRender.ships);
      expect(firstRender.player1Board).toBe(secondRender.player1Board);
      expect(firstRender.player2Board).toBe(secondRender.player2Board);
    });

    test('should update references only when relevant state changes', () => {
      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      const beforeUpdate = result.current.activePlayer;

      act(() => {
        store.dispatch(selectShip('Destroyer'));
      });

      const afterUnrelatedUpdate = result.current.activePlayer;
      expect(beforeUpdate).toBe(afterUnrelatedUpdate);

      act(() => {
        store.dispatch(setActivePlayer('Player2'));
      });

      const afterRelatedUpdate = result.current.activePlayer;
      expect(afterRelatedUpdate).toBe('Player2');
      expect(afterRelatedUpdate).not.toBe(beforeUpdate);
    });
  });

  describe('Complex State Scenarios', () => {
    test('should handle game in play state with winner', () => {
      act(() => {
        store.dispatch(setGameStatus('InPlay'));
        store.dispatch(setActivePlayer('Player2'));
        store.dispatch(setWinner('Player1'));
        store.dispatch(selectShip('Carrier'));
      });

      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current).toEqual({
        ships: expect.any(Array),
        selectedShipName: 'Carrier',
        gameStatus: 'InPlay',
        activePlayer: 'Player2',
        winner: 'Player1',
        player1Board: expect.any(Array),
        player2Board: expect.any(Array),
        player1AllShipsPlaced: expect.any(Boolean),
        player2AllShipsPlaced: expect.any(Boolean),
      });
    });

    test('should handle reset scenario', () => {
      act(() => {
        store.dispatch(setActivePlayer('Player2'));
        store.dispatch(selectShip('Destroyer'));
      });

      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.activePlayer).toBe('Player2');
      expect(result.current.selectedShipName).toBe('Destroyer');

      act(() => {
        store.dispatch(resetGameState());
        store.dispatch(resetSelectShipState());
      });

      expect(result.current.activePlayer).toBe('Player1');
      expect(result.current.selectedShipName).toBeNull();
      expect(result.current.gameStatus).toBe('SettingUp');
      expect(result.current.winner).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid ship names gracefully', () => {
      act(() => {
        store.dispatch(selectShip('InvalidShipName' as unknown as ShipName));
      });

      const { result } = renderHook(() => useReduxSelectors(), { wrapper });

      expect(result.current.selectedShipName).toBe('InvalidShipName');
      expect(result.current.gameStatus).toBe('SettingUp');
      expect(result.current.activePlayer).toBe('Player1');
    });
  });
});
