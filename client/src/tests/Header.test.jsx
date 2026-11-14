import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import { describe, expect, it } from 'vitest';
describe('Header', () => {
  it('renders navigation and marks the current page', () => {
    render(<MemoryRouter initialEntries={['/services']}><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Doctors' })).toBeInTheDocument();
  });
});
