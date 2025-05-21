import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/admin/Login';
import { test, expect, vi, beforeEach, afterAll } from 'vitest';

const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
afterAll(() => consoleError.mockRestore());
vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));


vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  };
});

import { login } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

beforeEach(() => {
  mockNavigate.mockReset();
  localStorage.clear();
});

test('renders login form', () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/Admin Code/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
});

test('shows error when login fails', async () => {
  (login as any).mockRejectedValueOnce(new Error('Login failed'));
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Admin Code/i), { target: { value: 'ADMIN' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'badpass' } });
  fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

  expect(await screen.findByText(/Login failed/i)).toBeInTheDocument();
});

test('shows error if not admin', async () => {
  (login as any).mockResolvedValueOnce({ token: 'dummy-token' });
  (jwtDecode as any).mockReturnValueOnce({ role: 'client' }); // Not admin

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Admin Code/i), { target: { value: 'ADMIN' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } });
  fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

  expect(await screen.findByText(/you are not an admin/i)).toBeInTheDocument();
});

test('navigates to /admin if admin login is successful', async () => {
  (login as any).mockResolvedValueOnce({ token: 'admin-token' });
  (jwtDecode as any).mockReturnValueOnce({ role: 'admin' });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Admin Code/i), { target: { value: 'ADMIN' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'goodpass' } });
  fireEvent.click(screen.getByRole('button', { name: /Log In/i }));
  await screen.findByRole('button', { name: /Log In/i });
  expect(mockNavigate).toHaveBeenCalledWith('/admin');
});
