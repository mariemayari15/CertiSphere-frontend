import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Request from '../features/client/certificates/Request';
import { test, expect, vi, beforeAll, beforeEach } from 'vitest';


beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: false,
      media: q,
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
  fetchCertificateTypes: vi.fn(),
  uploadDocuments: vi.fn(),
  generateCertificate: vi.fn(),
}));


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});


vi.mock('antd', async () => {
  const antd = await import('antd');
  const message = { error: vi.fn(), success: vi.fn(), warning: vi.fn() };

  const Upload = ({ children, onChange, fileList }: any) => (
    <div>
      <input
        data-testid="uploader"
        type="file"
        multiple
        onChange={(e) => {
          const dummy = Array.from(e.target.files as FileList).map((f) => ({
            uid: f.name,
            name: f.name,
            status: 'done',
            originFileObj: f,
          }));
          onChange({ fileList: [...fileList, ...dummy] });
        }}
      />
      {children}
    </div>
  );

  const Button = ({
    onClick,
    children,
    loading: _loading,
    disabled: _disabled,
    ...rest
  }: any) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  );

 
  const Checkbox: any = ({ children, ...rest }: any) => (
    <label>
      <input type="checkbox" {...rest} /> {children}
    </label>
  );
  Checkbox.Group = ({ options, value, onChange }: any) => (
    <div>
      {options.map((o: any) => (
        <label key={o.value} style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={value.includes(o.value)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...value, o.value]
                  : value.filter((v: string) => v !== o.value)
              )
            }
          />{' '}
          {o.label}
        </label>
      ))}
    </div>
  );

  return { ...antd, Upload, Button, Checkbox, message };
});


import {
  fetchCertificateTypes,
  uploadDocuments,
  generateCertificate,
} from '../services/clientService';
import { message } from 'antd';


beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('authToken', 'token');
});

const mockTypes = [
  { id: 1, typeName: 'Test Cert', requiredDocs: ['Doc A', 'Doc B'], price: 5000 },
];
const mockISOs = ['ISO9001', 'ISO14001'];



test('loads certificate types & ISO options on mount', async () => {
  (fetchCertificateTypes as any).mockResolvedValueOnce({
    certificateTypes: mockTypes,
    isoOptions: mockISOs,
  });

  render(
    <MemoryRouter>
      <Request />
    </MemoryRouter>
  );

  expect(await screen.findByText('ISO9001')).toBeInTheDocument();
});

test('shows required docs after type selection', async () => {
  (fetchCertificateTypes as any).mockResolvedValueOnce({
    certificateTypes: mockTypes,
    isoOptions: mockISOs,
  });

  render(
    <MemoryRouter>
      <Request />
    </MemoryRouter>
  );

  fireEvent.mouseDown(await screen.findByRole('combobox'));
  fireEvent.click(screen.getByText('Test Cert'));

  expect(await screen.findByText('Doc A')).toBeInTheDocument();
  expect(screen.getByText('Doc B')).toBeInTheDocument();
});

test('warns if user clicks upload with no file selected', async () => {
  (fetchCertificateTypes as any).mockResolvedValueOnce({
    certificateTypes: mockTypes,
    isoOptions: mockISOs,
  });

  render(
    <MemoryRouter>
      <Request />
    </MemoryRouter>
  );

  fireEvent.mouseDown(await screen.findByRole('combobox'));
  fireEvent.click(screen.getByText('Test Cert'));
  await screen.findByText('Doc A'); // state update

  fireEvent.click(await screen.findByRole('button', { name: /Request the Certificate/i }));

  expect(message.warning).toHaveBeenCalledWith(
    'Please select at least one document to upload!'
  );
});

test('happy path: uploads docs and generates certificate', async () => {
  (fetchCertificateTypes as any).mockResolvedValueOnce({
    certificateTypes: mockTypes,
    isoOptions: mockISOs,
  });
  (uploadDocuments as any).mockResolvedValueOnce({ certificateId: 99 });
  (generateCertificate as any).mockResolvedValueOnce({ message: 'Generated!' });

  render(
    <MemoryRouter>
      <Request />
    </MemoryRouter>
  );

  fireEvent.mouseDown(await screen.findByRole('combobox'));
  fireEvent.click(screen.getByText('Test Cert'));
  await screen.findByText('Doc A');

  fireEvent.click(screen.getByText('ISO9001'));

  const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByTestId('uploader'), { target: { files: [file] } });

  fireEvent.click(screen.getByRole('button', { name: /Request the Certificate/i }));

  await waitFor(() => expect(uploadDocuments).toHaveBeenCalled());

  expect(generateCertificate).toHaveBeenCalledWith(expect.any(String), {
    certificateId: 99,
    certificateType: 1,
    certificateName: '',
    isoStandards: ['ISO9001'],
  });
  expect(message.success).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
