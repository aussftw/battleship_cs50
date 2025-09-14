import { setActivePlayer, setGameStatus } from '@/features/gameReducer';
import { selectShip } from '@/features/selectShipReducer';
import store from './store';

describe('Store', () => {
  test('should handle game actions', () => {
    store.dispatch(setActivePlayer('Player2'));
    store.dispatch(setGameStatus('InPlay'));
    const state = store.getState();
    expect(state.game.activePlayer).toEqual('Player2');
    expect(state.game.gameStatus).toEqual('InPlay');
  });

  test('should handle selectShip actions', () => {
    store.dispatch(selectShip('Destroyer'));
    const state = store.getState();
    expect(state.selectShip.selectedShip).toEqual('Destroyer');
  });
});
