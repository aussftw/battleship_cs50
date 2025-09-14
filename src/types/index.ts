export type CellStatus = 'EMPTY' | 'SHIP' | 'HIT' | 'MISS';

export type Row = CellStatus[];
export type Board = Row[];

export type ShipName =
  | 'Destroyer'
  | 'Submarine'
  | 'Cruiser'
  | 'Battleship'
  | 'Carrier';

export type PlacedShip = {
  x: number;
  y: number;
  length: number;
  direction: 'HORIZONTAL' | 'VERTICAL';
};

export type ShipTemplate = {
  name: ShipName | null;
  size: number;
  isPlaced: boolean;
};

// Union type for backward compatibility
export type Ship = PlacedShip | ShipTemplate;

export type GameStatus = 'SettingUp' | 'InPlay' | 'Ended';

export type Player = 'Player1' | 'Player2';
