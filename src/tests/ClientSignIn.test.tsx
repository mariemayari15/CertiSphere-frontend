import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignIn from '../features/client/SignIn';
import { test, expect, vi, beforeEach } from 'vitest';
import { loginClient } from '../services/authService';

vi.mock('../services/authService', () => ({
  loginClient: vi.fn(),
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


beforeEach(() => {
  mockNavigate.mockReset();
  vi.clearAllMocks();
  localStorage.clear();
});



test('renders sign-in form', () => {
  render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );

  expect(screen.getByLabelText(/Client Code/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
});

test('shows error when login fails', async () => {
  (loginClient as any).mockRejectedValueOnce(new Error('Login failed'));

  render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Client Code/i), { target: { value: 'CLIENT123' } });
  fireEvent.change(screen.getByLabelText(/Password/i),    { target: { value: 'badpass' } });
  fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  expect(await screen.findByText(/Login failed/i)).toBeInTheDocument();
});

test('navigates to /dashboard on successful login', async () => {
  (loginClient as any).mockResolvedValueOnce('token-123');

  render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Client Code/i), { target: { value: 'CLIENT123' } });
  fireEvent.change(screen.getByLabelText(/Password/i),    { target: { value: 'goodpass' } });
  fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

 
  await screen.findByRole('button', { name: /Sign In/i });

  expect(localStorage.getItem('authToken')).toBe('token-123');
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
