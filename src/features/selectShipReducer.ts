import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ShipName, ShipTemplate } from '@/types';
import { SHIP_SIZES } from '@/constants';

type selectShipState = {
  ships: ShipTemplate[];
  selectedShip: ShipName | null;
};

export const selectShipInitialState: selectShipState = {
  ships: [
    {
      name: 'Destroyer',
      size: SHIP_SIZES['Destroyer'],
      isPlaced: false,
    },
    {
      name: 'Submarine',
      size: SHIP_SIZES['Submarine'],
      isPlaced: false,
    },
    {
      name: 'Cruiser',
      size: SHIP_SIZES['Cruiser'],
      isPlaced: false,
    },
    {
      name: 'Battleship',
      size: SHIP_SIZES['Battleship'],
      isPlaced: false,
    },
    {
      name: 'Carrier',
      size: SHIP_SIZES['Carrier'],
      isPlaced: false,
    },
  ],
  selectedShip: null,
};

const selectShipSlice = createSlice({
  name: 'selectShip',
  initialState: selectShipInitialState,
  reducers: {
    selectShip: (state, action: PayloadAction<ShipName | null>) => {
      state.selectedShip = action.payload;
    },
    placeShip: (state, action: PayloadAction<string>) => {
      const ship = state.ships.find((s) => s.name === action.payload);
      if (ship) {
        ship.isPlaced = true;
      }
      state.selectedShip = null;
    },
    resetShips: (state) => {
      state.ships.forEach((ship) => {
        ship.isPlaced = false;
      });
    },
    resetSelectShipState: () => {
      return selectShipInitialState;
    },
  },
});

export const { selectShip, placeShip, resetShips, resetSelectShipState } =
  selectShipSlice.actions;

export default selectShipSlice.reducer;
