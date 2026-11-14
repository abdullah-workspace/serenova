import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SlotChips from '../components/ui/SlotChips.jsx';

describe('SlotChips', () => {
  it('selects a slot with keyboard input', async () => {
    const onChange = vi.fn();
    render(<SlotChips slots={[{ startAt: '2027-01-01T09:00:00.000Z', label: '09:00' }]} value="" onChange={onChange} />);
    screen.getByRole('radio').focus();
    fireEvent.keyDown(screen.getByRole('radio'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith('2027-01-01T09:00:00.000Z');
  });
});
