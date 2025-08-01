import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { useAuthStore } from '@/store/auth';

// Mock the auth store
jest.mock('@/store/auth');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('Header', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      checkAuth: jest.fn(),
      updateUser: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard title', () => {
    render(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(<Header />);
    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
  });

  it('displays default user initial when no user', () => {
    render(<Header />);
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('displays user name and initial when user is logged in', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      isAuthenticated: true,
      token: 'token',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      checkAuth: jest.fn(),
      updateUser: jest.fn(),
    });

    render(<Header />);
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});