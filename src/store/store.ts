import { configureStore } from '@reduxjs/toolkit';

import selectShipReducer from '@/features/selectShipReducer';
import gameReducer from '@/features/gameReducer';

const store = configureStore({
  reducer: {
    selectShip: selectShipReducer,
    game: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
