import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './page';
import * as firebaseAuth from 'firebase/auth';
import { useRouter } from 'next/navigation';

jest.mock('firebase/auth');
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Login Page', () => {
  it('renders the login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('shows error on login failure', async () => {
    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ message: 'Invalid credentials' });
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText(/Sign In/i));
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('redirects to /admin on successful login', async () => {
    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/Sign In/i));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });
}); 