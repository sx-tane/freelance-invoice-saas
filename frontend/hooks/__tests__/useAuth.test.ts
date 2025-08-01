import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/store/auth';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock auth store
jest.mock('@/store/auth');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('useAuth', () => {
  const mockCheckAuth = jest.fn();

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      checkAuth: mockCheckAuth,
      updateUser: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls checkAuth on mount', () => {
    renderHook(() => useAuth());
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });

  it('redirects to login when requireAuth is true and user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      checkAuth: mockCheckAuth,
      updateUser: jest.fn(),
    });

    renderHook(() => useAuth(true));
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to dashboard when requireAuth is false and user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: '1', name: 'John', email: 'john@example.com' },
      isAuthenticated: true,
      token: 'token',
      login: jest.fn(),
      logout: jest.fn(),
      clearAuth: jest.fn(),
      checkAuth: mockCheckAuth,
    });

    renderHook(() => useAuth(false));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('does not redirect when requireAuth is true and user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: '1', name: 'John', email: 'john@example.com' },
      isAuthenticated: true,
      token: 'token',
      login: jest.fn(),
      logout: jest.fn(),
      clearAuth: jest.fn(),
      checkAuth: mockCheckAuth,
    });

    renderHook(() => useAuth(true));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when requireAuth is false and user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      checkAuth: mockCheckAuth,
      updateUser: jest.fn(),
    });

    renderHook(() => useAuth(false));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('returns authentication status', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: '1', name: 'John', email: 'john@example.com' },
      isAuthenticated: true,
      token: 'token',
      login: jest.fn(),
      logout: jest.fn(),
      clearAuth: jest.fn(),
      checkAuth: mockCheckAuth,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });
});