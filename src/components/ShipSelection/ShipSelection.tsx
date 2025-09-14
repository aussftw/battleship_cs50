import { useCallback } from 'react';
import { clsx } from 'clsx';

import Cell from '@/components/Cell/Cell';
import { ShipName, ShipTemplate } from '@/types';

type ShipSelectionProps = {
  ships: ShipTemplate[];
  selectedShipName: ShipName | null;
  onSelectShip: (ship: ShipTemplate) => void;
};

const ShipSelection: React.FC<ShipSelectionProps> = ({
  ships,
  selectedShipName,
  onSelectShip,
}) => {
  const handleSelectShip = useCallback(
    (ship: ShipTemplate) => {
      onSelectShip(ship);
    },
    [onSelectShip],
  );

  const renderShip = (ship: ShipTemplate) => {
    const className = clsx('ship-item', {
      'ship-item--selected': selectedShipName === ship.name,
      'ship-item--unselected': selectedShipName !== ship.name,
    });

    return !ship.isPlaced ? (
      <div
        key={ship.name}
        className={className}
        onClick={() => handleSelectShip(ship)}
      >
        <div className="ship-cells">
          {[...Array(ship.size)].map((_, idx) => (
            <Cell key={idx} status={'SHIP'} className="cell--small" />
          ))}
        </div>
        <span className="ship-name">
          {ship.name} ({ship.size} cells)
        </span>
      </div>
    ) : null;
  };

  return (
    <div className="ship-selection">
      {ships.map((ship) => renderShip(ship))}
    </div>
  );
};

export default ShipSelection;
