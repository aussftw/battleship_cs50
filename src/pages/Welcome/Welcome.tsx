import React from 'react';

type WelcomeProps = {
  onPress: () => void;
};

export const Welcome: React.FC<WelcomeProps> = ({ onPress }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Welcome to Battleship
        </h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Game Rules:</h2>
          <div className="pl-4 border-l-4 border-red-600">
            <p className="mb-3">1. The game consists of two players.</p>
            <p className="mb-3">
              2. Each player takes a turn to set their ships on the board.
            </p>
            <p className="mb-3">
              3. Players take turns firing at the opponent's board.
            </p>
            <p className="mb-3">
              4. The goal is to sink all of the opponent's ships.
            </p>
            <p className="mb-3">5. The first player to sink all ships wins!</p>
          </div>
        </div>

        <button
          onClick={onPress}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition duration-200"
        >
          Let's play!
        </button>
      </div>
    </div>
  );
};
