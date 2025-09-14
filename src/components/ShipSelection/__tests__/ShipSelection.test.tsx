import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShipSelection from '../ShipSelection';
import { ShipName, ShipTemplate } from '@/types';

jest.mock('@/components/Cell/Cell', () => {
  const MockCell = ({
    status,
    className,
  }: {
    status: string;
    className?: string;
  }) => (
    <div data-testid="cell" data-status={status} className={className}>
      Cell
    </div>
  );
  return {
    __esModule: true,
    default: MockCell,
  };
});

jest.mock('clsx', () => ({
  clsx: jest.fn((...args: unknown[]) => {
    return args
      .flat()
      .filter(Boolean)
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(' ');
        }
        return '';
      })
      .join(' ');
  }),
}));

describe('ShipSelection Component', () => {
  const mockOnSelectShip = jest.fn();

  const createShip = (
    name: ShipName,
    size: number,
    isPlaced: boolean = false,
  ): ShipTemplate => ({
    name,
    size,
    isPlaced,
  });

  const defaultShips: ShipTemplate[] = [
    createShip('Destroyer', 1),
    createShip('Submarine', 2),
    createShip('Cruiser', 3),
    createShip('Battleship', 4),
    createShip('Carrier', 5),
  ];

  beforeEach(() => {
    mockOnSelectShip.mockClear();
  });

  describe('Basic Rendering & Props', () => {
    it('renders without crashing', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );
      expect(screen.getByText('Destroyer (1 cells)')).toBeInTheDocument();
    });

    it('renders all unplaced ships with correct names and sizes', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      expect(screen.getByText('Destroyer (1 cells)')).toBeInTheDocument();
      expect(screen.getByText('Submarine (2 cells)')).toBeInTheDocument();
      expect(screen.getByText('Cruiser (3 cells)')).toBeInTheDocument();
      expect(screen.getByText('Battleship (4 cells)')).toBeInTheDocument();
      expect(screen.getByText('Carrier (5 cells)')).toBeInTheDocument();
    });

    it('renders correct number of Cell components for each ship size', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1), createShip('Cruiser', 3)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(4); // 1 + 3 cells
    });

    it('passes correct props to Cell components', () => {
      render(
        <ShipSelection
          ships={[createShip('Submarine', 2)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cells = screen.getAllByTestId('cell');
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('data-status', 'SHIP');
        expect(cell).toHaveClass('cell--small');
      });
    });
  });

  describe('Ship Selection Interactions', () => {
    it('calls onSelectShip when a ship is clicked', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const destroyerShip = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      fireEvent.click(destroyerShip!);

      expect(mockOnSelectShip).toHaveBeenCalledTimes(1);
      expect(mockOnSelectShip).toHaveBeenCalledWith(defaultShips[0]);
    });

    it('calls onSelectShip with correct ship object for each ship', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cruiserShip = screen.getByText('Cruiser (3 cells)').closest('div');
      fireEvent.click(cruiserShip!);

      expect(mockOnSelectShip).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cruiser',
          size: 3,
          isPlaced: false,
        }),
      );
    });

    it('handles multiple ship selections correctly', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const destroyerShip = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      const carrierShip = screen.getByText('Carrier (5 cells)').closest('div');

      fireEvent.click(destroyerShip!);
      fireEvent.click(carrierShip!);

      expect(mockOnSelectShip).toHaveBeenCalledTimes(2);
      expect(mockOnSelectShip).toHaveBeenNthCalledWith(1, defaultShips[0]);
      expect(mockOnSelectShip).toHaveBeenNthCalledWith(2, defaultShips[4]);
    });
  });

  describe('Visual Styling & Selection State', () => {
    it('applies selected styling when ship is selected', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName="Destroyer"
          onSelectShip={mockOnSelectShip}
        />,
      );

      const destroyerShip = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      expect(destroyerShip).toHaveClass('ship-item', 'ship-item--selected');
    });

    it('applies unselected styling when ship is not selected', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName="Destroyer"
          onSelectShip={mockOnSelectShip}
        />,
      );

      const submarineShip = screen
        .getByText('Submarine (2 cells)')
        .closest('div');
      expect(submarineShip).toHaveClass('ship-item', 'ship-item--unselected');
    });

    it('applies cursor-pointer class to all ship elements', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const shipElement = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      expect(shipElement).toHaveClass('ship-item');
    });

    it('applies correct base classes to ship elements', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const shipElement = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      expect(shipElement).toHaveClass('ship-item');
    });
  });

  describe('Conditional Rendering Logic', () => {
    it('only renders unplaced ships', () => {
      const mixedShips: ShipTemplate[] = [
        createShip('Destroyer', 1, false), // unplaced
        createShip('Submarine', 2, true), // placed
        createShip('Cruiser', 3, false), // unplaced
      ];

      render(
        <ShipSelection
          ships={mixedShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      expect(screen.getByText('Destroyer (1 cells)')).toBeInTheDocument();
      expect(screen.queryByText('Submarine (2 cells)')).not.toBeInTheDocument();
      expect(screen.getByText('Cruiser (3 cells)')).toBeInTheDocument();
    });

    it('renders nothing when all ships are placed', () => {
      const allPlacedShips: ShipTemplate[] = [
        createShip('Destroyer', 1, true),
        createShip('Submarine', 2, true),
      ];

      render(
        <ShipSelection
          ships={allPlacedShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      expect(screen.queryByText('Destroyer (1 cells)')).not.toBeInTheDocument();
      expect(screen.queryByText('Submarine (2 cells)')).not.toBeInTheDocument();
    });

    it('renders correctly when no ships are placed', () => {
      const unplacedShips: ShipTemplate[] = [
        createShip('Destroyer', 1, false),
        createShip('Submarine', 2, false),
      ];

      render(
        <ShipSelection
          ships={unplacedShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      expect(screen.getByText('Destroyer (1 cells)')).toBeInTheDocument();
      expect(screen.getByText('Submarine (2 cells)')).toBeInTheDocument();
    });
  });

  describe('Container and Layout', () => {
    it('applies correct container classes', () => {
      const { container } = render(
        <ShipSelection
          ships={[createShip('Destroyer', 1)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('ship-selection');
    });

    it('maintains correct spacing between ships', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1), createShip('Submarine', 2)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const container = screen.getByText('Destroyer (1 cells)').closest('div');
      expect(container?.parentElement).toHaveClass('ship-selection');
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('renders correctly with empty ships array', () => {
      render(
        <ShipSelection
          ships={[]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cells = screen.queryAllByTestId('cell');
      expect(cells).toHaveLength(0);
    });

    it('handles null selectedShipName correctly', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const shipElement = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      expect(shipElement).toHaveClass('ship-item', 'ship-item--unselected');
    });

    it('handles invalid selectedShipName correctly', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1)]}
          selectedShipName={'InvalidShip' as ShipName}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const shipElement = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      expect(shipElement).toHaveClass('ship-item', 'ship-item--unselected');
    });

    it('handles ship with size 0', () => {
      render(
        <ShipSelection
          ships={[createShip('Destroyer', 0)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      expect(screen.getByText('Destroyer (0 cells)')).toBeInTheDocument();
      const cells = screen.queryAllByTestId('cell');
      expect(cells).toHaveLength(0);
    });

    it('handles ships with large sizes', () => {
      render(
        <ShipSelection
          ships={[createShip('MegaShip' as ShipName, 10)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(10);
    });
  });

  describe('Performance and useCallback', () => {
    it('calls handleSelectShip when ship is clicked', () => {
      const onSelectShipSpy = jest.fn();

      render(
        <ShipSelection
          ships={[createShip('Destroyer', 1)]}
          selectedShipName={null}
          onSelectShip={onSelectShipSpy}
        />,
      );

      const shipElement = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      fireEvent.click(shipElement!);

      expect(onSelectShipSpy).toHaveBeenCalledTimes(1);
    });

    it('renders ship visual representation correctly', () => {
      render(
        <ShipSelection
          ships={[createShip('Battleship', 4)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const shipCells = screen.getAllByTestId('cell');
      expect(shipCells).toHaveLength(4);

      const cellContainer = shipCells[0].closest('.ship-cells');
      expect(cellContainer).toBeInTheDocument();
    });
  });

  describe('Integration with Cell Component', () => {
    it('passes correct status to all Cell components', () => {
      render(
        <ShipSelection
          ships={[createShip('Cruiser', 3)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cells = screen.getAllByTestId('cell');
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('data-status', 'SHIP');
      });
    });

    it('passes correct className to Cell components', () => {
      render(
        <ShipSelection
          ships={[createShip('Submarine', 2)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const cells = screen.getAllByTestId('cell');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--small');
      });
    });

    it('renders correct cell arrangement for ship visualization', () => {
      render(
        <ShipSelection
          ships={[createShip('Carrier', 5)]}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      const shipElement = screen
        .getByText('Carrier (5 cells)')
        .closest('.ship-item');
      const cellContainer = shipElement?.querySelector('.ship-cells');
      expect(cellContainer).toBeInTheDocument();

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(5);
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides clear ship identification with name and size', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      expect(screen.getByText('Destroyer (1 cells)')).toBeInTheDocument();
      expect(screen.getByText('Submarine (2 cells)')).toBeInTheDocument();
      expect(screen.getByText('Cruiser (3 cells)')).toBeInTheDocument();
      expect(screen.getByText('Battleship (4 cells)')).toBeInTheDocument();
      expect(screen.getByText('Carrier (5 cells)')).toBeInTheDocument();
    });

    it('maintains consistent styling across different ship states', () => {
      render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName="Cruiser"
          onSelectShip={mockOnSelectShip}
        />,
      );

      const selectedShip = screen.getByText('Cruiser (3 cells)').closest('div');
      const unselectedShip = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');

      expect(selectedShip).toHaveClass('ship-item', 'ship-item--selected');
      expect(unselectedShip).toHaveClass('ship-item', 'ship-item--unselected');
    });

    it('provides visual feedback for ship selection state', () => {
      const { rerender } = render(
        <ShipSelection
          ships={defaultShips}
          selectedShipName={null}
          onSelectShip={mockOnSelectShip}
        />,
      );

      let destroyerShip = screen
        .getByText('Destroyer (1 cells)')
        .closest('div');
      expect(destroyerShip).toHaveClass('ship-item', 'ship-item--unselected');

      rerender(
        <ShipSelection
          ships={defaultShips}
          selectedShipName="Destroyer"
          onSelectShip={mockOnSelectShip}
        />,
      );

      destroyerShip = screen.getByText('Destroyer (1 cells)').closest('div');
      expect(destroyerShip).toHaveClass('ship-item', 'ship-item--selected');
    });
  });
});
