import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddAdmin from '../features/admin/AddAdmin';
import {  test, expect, vi, beforeEach, afterEach } from 'vitest';


vi.mock('../services/adminService', () => ({
  registerNewAdmin: vi.fn().mockResolvedValue('ADMIN123'),
}));


vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

beforeEach(() => {
  localStorage.setItem(
    'authToken',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjEsImV4cCI6MTg0NDQ0NDQ0NH0.DUMMY'
  );
});
afterEach(() => {
  localStorage.clear();
});

test('shows success message after admin creation', async () => {
  render(
    <MemoryRouter>
      <AddAdmin />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'CEO' } });
  fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@doe.com' } });
  fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+1234567890' } });

  fireEvent.click(screen.getByText(/Create Administrator/i));

  expect(
    await screen.findByText(/Admin successfully registered! Admin Code: ADMIN123/i)
  ).toBeInTheDocument();
});
