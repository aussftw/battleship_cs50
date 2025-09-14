import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Footer from './Footer';
import { CURRENT_YEAR } from '@/constants';

describe('Footer Component', () => {
  test('renders correctly', () => {
    render(<Footer />);

    expect(screen.getByText(/Developed and Made with/)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`by Alexander Kaminskiy © ${CURRENT_YEAR}`)),
    ).toBeInTheDocument();

    const heartSymbol = screen.getByText(/♥/);
    expect(heartSymbol).toHaveClass('text-red-500');
  });
});
