import {
  allShipsPlacedSelector,
  player1AllShipsPlacedSelector,
  player2AllShipsPlacedSelector,
  shipsSelector,
  activePlayerSelector,
  player1BoardSelector,
  player2BoardSelector,
  selectedShipNameSelector,
  gameStatusSelector,
  winnerSelector,
} from './';
import { RootState } from '@/store/store';

describe('Selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      game: {
        activePlayer: 'Player1',
        gameStatus: 'SettingUp',
        player1Board: [['EMPTY']],
        player2Board: [['EMPTY']],
        winner: null,
      },
      selectShip: {
        ships: [],
        selectedShip: null,
      },
    };
  });

  test('allShipsPlacedSelector', () => {
    const selector = allShipsPlacedSelector('player1');
    expect(selector(state)).toBe(false);
  });

  test('player1AllShipsPlacedSelector', () => {
    expect(player1AllShipsPlacedSelector(state)).toBe(false);
  });

  test('player2AllShipsPlacedSelector', () => {
    expect(player2AllShipsPlacedSelector(state)).toBe(false);
  });

  test('shipsSelector', () => {
    expect(shipsSelector(state)).toEqual([]);
  });

  test('activePlayerSelector', () => {
    expect(activePlayerSelector(state)).toBe('Player1');
  });

  test('player1BoardSelector', () => {
    expect(player1BoardSelector(state)).toEqual([['EMPTY']]);
  });

  test('player2BoardSelector', () => {
    expect(player2BoardSelector(state)).toEqual([['EMPTY']]);
  });

  test('selectedShipNameSelector', () => {
    expect(selectedShipNameSelector(state)).toBeNull();
  });

  test('gameStatusSelector', () => {
    expect(gameStatusSelector(state)).toBe('SettingUp');
  });

  test('winnerSelector', () => {
    expect(winnerSelector(state)).toBeNull();
  });
});
