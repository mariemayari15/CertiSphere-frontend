import { render, screen, fireEvent} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../features/client/SignUp';
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerClient } from '../services/authService';


vi.mock('../services/authService', () => ({
  registerClient: vi.fn(),
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


vi.mock('bootstrap', () => {
  const instance = { show: vi.fn(), hide: vi.fn() };
  return { Modal: vi.fn(() => instance) };
});


beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
});


const fillValidFields = () => {
  fireEvent.change(screen.getByLabelText(/Business Name/i),   { target: { value: 'ACME' } });
  fireEvent.change(screen.getByLabelText(/Business Type/i),   { target: { value: 'llc' } });
  fireEvent.change(screen.getByLabelText(/Industry/i),        { target: { value: 'technology' } });
  fireEvent.change(screen.getByLabelText(/^First Name/i),     { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText(/^Last Name/i),      { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText(/Title\/Position/i), { target: { value: 'CEO' } });
  fireEvent.change(screen.getByLabelText(/Email Address/i),   { target: { value: 'john@acme.com' } });
  fireEvent.change(screen.getByLabelText(/Phone Number/i),    { target: { value: '1234567890' } });
  fireEvent.change(screen.getByLabelText(/^Create Password/i),{ target: { value: 'Passw0rd!' } });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i),{ target: { value: 'Passw0rd!' } });
};


test('renders sign-up form', () => {
  render(<MemoryRouter><SignUp /></MemoryRouter>);
  expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Create CertiSphere Account/i })).toBeInTheDocument();
});

test('shows validation errors when required fields are missing', async () => {
  render(<MemoryRouter><SignUp /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /Create CertiSphere Account/i }));
  expect(await screen.findByText(/Business name is required/i)).toBeInTheDocument();
});

test('shows alert if registerClient rejects', async () => {
  (registerClient as any).mockRejectedValueOnce(new Error('Server down'));
  render(<MemoryRouter><SignUp /></MemoryRouter>);
  fillValidFields();
  fireEvent.click(screen.getByRole('button', { name: /Create CertiSphere Account/i }));
  expect(await screen.findByText(/Server down/i)).toBeInTheDocument();
});



