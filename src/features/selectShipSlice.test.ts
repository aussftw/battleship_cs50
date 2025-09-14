import selectShipSlice, {
  selectShipInitialState,
  selectShip,
  placeShip,
  resetShips,
  resetSelectShipState,
} from './selectShipReducer';
import { ShipTemplate } from '@/types';

describe('selectShipSlice', () => {
  test('should handle initial state', () => {
    expect(selectShipSlice(undefined, { type: 'unknown' })).toEqual(
      selectShipInitialState,
    );
  });

  test('should handle selectShip', () => {
    const actual = selectShipSlice(
      selectShipInitialState,
      selectShip('Destroyer'),
    );
    expect(actual.selectedShip).toEqual('Destroyer');
  });

  test('should handle placeShip', () => {
    const actual = selectShipSlice(
      selectShipInitialState,
      placeShip('Destroyer'),
    );
    expect(
      actual.ships.find((ship: ShipTemplate) => ship.name === 'Destroyer')
        ?.isPlaced,
    ).toEqual(true);
    expect(actual.selectedShip).toBeNull();
  });

  test('should handle resetShips', () => {
    const initialState = {
      ...selectShipInitialState,
      ships: selectShipInitialState.ships.map((ship: ShipTemplate) => ({
        ...ship,
        isPlaced: true,
      })),
    };
    const actual = selectShipSlice(initialState, resetShips());
    expect(
      actual.ships.every((ship: ShipTemplate) => ship.isPlaced === false),
    ).toEqual(true);
  });

  test('should handle resetSelectShipState', () => {
    const initialState = {
      ...selectShipInitialState,
      selectedShip: 'Destroyer' as const,
      ships: selectShipInitialState.ships.map((ship: ShipTemplate) => ({
        ...ship,
        isPlaced: true,
      })),
    };
    const actual = selectShipSlice(initialState, resetSelectShipState());
    expect(actual).toEqual(selectShipInitialState);
  });
});
