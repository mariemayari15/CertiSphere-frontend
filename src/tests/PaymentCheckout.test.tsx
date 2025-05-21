import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentCheckout from '../pages/client/payment/PaymentCheckout';
import { test, expect, vi, beforeAll, beforeEach } from 'vitest';

import {
  createPaymentIntent,
  markCertificatePaid,
} from '../services/clientService';
import { message } from 'antd';
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),           
      removeListener: vi.fn(),        
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
});

vi.mock('../services/clientService', () => ({
  createPaymentIntent: vi.fn(),
  markCertificatePaid: vi.fn(),
}));

const confirmCardPaymentMock = vi.fn();
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({ confirmCardPayment: confirmCardPaymentMock }),
  useElements: () => ({ getElement: () => ({}) }),
  CardElement: () => <div data-testid="card-element" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ certificateId: '42' }),
  };
});

vi.mock('antd', async () => {
  const antd = await import('antd');
  const message = { error: vi.fn(), success: vi.fn() };
  const Checkbox = ({ children, ...rest }: any) => (
    <label>
      <input type="checkbox" {...rest} />
      {children}
    </label>
  );
  return { ...antd, message, Checkbox };
});


beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('authToken', 'token');
});
test('render payment ', async () => {
  (createPaymentIntent as any).mockResolvedValueOnce({
    clientSecret: 'cs',
    amount: 2500,
  });

  render(
    <MemoryRouter>
      <PaymentCheckout />
    </MemoryRouter>
  );

  expect(await screen.findByText(/€25\.00/)).toBeInTheDocument();
  expect(screen.getByTestId('card-element')).toBeInTheDocument();
});

test('shows error and redirects if createPaymentIntent fails', async () => {
  (createPaymentIntent as any).mockRejectedValueOnce(new Error('boom'));

  render(
    <MemoryRouter>
      <PaymentCheckout />
    </MemoryRouter>
  );

  await waitFor(() => expect(message.error).toHaveBeenCalledWith('boom'));
  expect(mockNavigate).toHaveBeenCalledWith('/user/payments');
});

test('navigates back when Back button clicked', async () => {
  (createPaymentIntent as any).mockResolvedValueOnce({
    clientSecret: 'cs',
    amount: 1000,
  });

  render(
    <MemoryRouter>
      <PaymentCheckout />
    </MemoryRouter>
  );

  fireEvent.click(await screen.findByRole('button', { name: /Back/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/user/payments');
});

test('handles successful payment flow', async () => {
  (createPaymentIntent as any).mockResolvedValueOnce({
    clientSecret: 'cs',
    amount: 1000,
  });
  confirmCardPaymentMock.mockResolvedValueOnce({
    error: null,
    paymentIntent: { status: 'succeeded' },
  });
  (markCertificatePaid as any).mockResolvedValueOnce({});

  render(
    <MemoryRouter>
      <PaymentCheckout />
    </MemoryRouter>
  );

  fireEvent.change(await screen.findByLabelText(/Cardholder name/i), {
    target: { value: 'John' },
  });
  fireEvent.change(screen.getByLabelText(/VAT \/ Tax ID/i), {
    target: { value: '123' },
  });
  fireEvent.change(screen.getByLabelText(/Billing address/i), {
    target: { value: 'Street' },
  });
  fireEvent.click(screen.getByRole('checkbox'));

  fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

  await waitFor(() => expect(markCertificatePaid).toHaveBeenCalled());
  expect(message.success).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard');
});
