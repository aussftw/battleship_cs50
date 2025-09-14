# Battleship Game - CS50 Final Project

#### Video Demo: https://www.youtube.com/watch?v=fj6mrZSYqB0

#### Description:

## Project Overview

For my CS50 final project, I created a modern, full-featured implementation of the classic Battleship board game using React, TypeScript, and Redux.

The game follows traditional Battleship rules: two players take turns placing ships on their respective 10x10 grids, then alternate shooting at each other's boards until one player sinks all of the opponent's ships. What makes this implementation special is its modern architecture, type safety, responsive design, and extensive test coverage.

I chose to build this project because it offered the perfect balance of complexity and familiarity - everyone knows how to play Battleship, but implementing it properly requires sophisticated state management, game logic validation, and user interface design.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aussftw/battleship_cs50
   cd battleship_cs50
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technical Stack and Architecture Decisions

### React with TypeScript

I chose React for its component-based architecture and excellent developer experience. TypeScript was essential for this project because it provides compile-time safety for complex game state transitions and prevents the runtime errors that are common in JavaScript applications with intricate logic.

### Component Architecture Design

One of most important architectural decisions was breaking down what could have been a monolithic Board component into three specialized components:

- **PlacementBoard**: Handles ship placement during the setup phase
- **ShootingBoard**: Manages shooting interactions during gameplay
- **PlayerBoard**: Provides read-only display of the player's own board

This separation follows the Single Responsibility Principle and makes each component easier to test and maintain. Each board type has distinct behaviors and user interactions, so separating them eliminated complex conditional logic that would have made a single Board component unwieldy.

## File Structure and Implementation Details

### Core Game Logic (`src/features/`)

**gameReducer.ts** contains the primary game state management with actions for:

- Player turn management (`setActivePlayer`)
- Game phase transitions (`setGameStatus`)
- Board updates (`setPlayerBoard`)
- Shooting logic (`playerShoot`)
- Win condition detection

**selectShipReducer.ts** handles ship placement state including:

- Currently selected ship tracking
- Available ships management
- Placement validation state

### Custom Hooks (`src/hooks/`)

I developed four custom hooks to encapsulate complex logic:

**useGameState.ts**: Manages game flow, modal states, and user actions. This hook was crucial for keeping the main Game component clean and focused on rendering.

**useShipPlacement.ts**: Handles all ship placement logic including validation for overlapping ships, boundary checking, and orientation management. The placement logic was one of the most challenging parts of the project because it required checking ship collisions and ensuring ships fit within the 10x10 grid.

**useBoardRenderer.tsx**: Provides shared board rendering logic across different board types. This hook prevents code duplication and ensures consistent cell rendering.

**useReduxSelectors.ts**: Groups related Redux selectors for better organization and performance through memoization.

### Helper Functions (`src/helpers/`)

**initializeBoard()**: Creates a fresh 10x10 game board. I used `Array.from()` with proper mapping to avoid the common JavaScript pitfall of shared array references.

**allShipsSunk()**: Implements win condition checking by scanning the entire board for remaining 'SHIP' cells.

**isValidPlacement()**: Validates ship placement attempts, checking boundaries and overlaps.

### Component Implementation

**Cell.tsx**: The fundamental building block representing each board square. Uses conditional styling based on cell status ('EMPTY', 'SHIP', 'HIT', 'MISS').

**Game.tsx**: The main game orchestrator that manages phase transitions and renders appropriate UI components based on game state.

**ShipSelection.tsx**: Provides the ship selection interface during setup, showing available ships and highlighting the currently selected one.

**GameModal.tsx**: Handles all modal interactions including turn transitions, game over states, and player notifications.

## Design Decisions and Challenges

### Game State Management

Managing the complex game state transitions required careful consideration. The game has three distinct phases:

1. **Setup Phase**: Players sequentially place their five ships
2. **Play Phase**: Turn-based shooting with modal transitions between turns
3. **End Phase**: Winner declaration and game reset options

Each phase required different UI components and user interactions, which influenced my decision to use conditional rendering based on game status.

### Testing Strategy

I implemented comprehensive testing covering 45 test cases across:

- Component behavior and rendering
- Custom hooks functionality
- Redux state management
- Helper function logic
- Integration scenarios

Testing was crucial for ensuring the complex game logic worked correctly, especially ship placement validation and win condition detection.

## Technical Challenges Overcome

### Ship Placement Validation

Implementing robust ship placement validation was surprisingly complex. I had to account for:

- Ships extending beyond board boundaries
- Overlapping with existing ships
- Different orientations (horizontal/vertical)
- Visual feedback during placement

### State Synchronization

Keeping game state synchronized across multiple components required careful Redux design. I used selectors with memoization to prevent unnecessary re-renders while ensuring all components had access to current game state.

### User Experience Design

Creating smooth transitions between game phases while maintaining clear visual feedback required extensive iteration on the modal system and turn management logic.

## Development Tools and Process

**Vite**: Chosen for fast development builds and excellent TypeScript support
**Tailwind CSS**: Enabled rapid UI development with consistent styling
**Jest + React Testing Library**: Provided comprehensive testing capabilities
**ESLint + Prettier**: Maintained code quality and consistency

The development process involved iterative testing and refinement, with particular attention to edge cases in game logic and user interaction patterns.
