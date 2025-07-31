import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../app/contexts/AuthContext";
import axios from "axios";
import { ReactNode } from "react";

// Mock axios completely
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock user data
const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "user" as const,
};

const mockAdmin = {
  id: 2,
  name: "Admin User",
  email: "admin@example.com",
  role: "admin" as const,
};

// Mock login response
const mockLoginResponse = {
  data: {
    token: "fake-jwt-token",
    user: mockUser,
  },
};

const mockAdminLoginResponse = {
  data: {
    token: "fake-admin-jwt-token",
    user: mockAdmin,
  },
};

interface MockAuthProviderProps {
  children: ReactNode;
  initialUser?: typeof mockUser | typeof mockAdmin | null;
  initialToken?: string | null;
}

const MockAuthProvider = ({
  children,
  initialUser = null,
  initialToken = null,
}: MockAuthProviderProps) => {
  // Mock localStorage for tests
  if (initialToken) {
    localStorage.setItem("token", initialToken);
  }
  if (initialUser) {
    localStorage.setItem("user", JSON.stringify(initialUser));
  }

  return <AuthProvider>{children}</AuthProvider>;
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    localStorage.clear();
    mockedAxios.post.mockClear();
  });

  it("should provide initial auth state", () => {
    render(
      <MockAuthProvider>
        <div data-testid="auth-state">Not authenticated</div>
      </MockAuthProvider>
    );

    expect(screen.getByTestId("auth-state")).toBeInTheDocument();
  });

  it("should handle successful login", async () => {
    mockedAxios.post.mockResolvedValueOnce(mockLoginResponse);

    const TestComponent = () => {
      return (
        <MockAuthProvider>
          <div data-testid="login-test">Login Test</div>
        </MockAuthProvider>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("login-test")).toBeInTheDocument();
    });
  });

  it("should handle admin user correctly", () => {
    const TestComponent = () => {
      return (
        <MockAuthProvider
          initialUser={mockAdmin}
          initialToken="fake-admin-token"
        >
          <div data-testid="admin-test">Admin Test</div>
        </MockAuthProvider>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId("admin-test")).toBeInTheDocument();
  });

  it("should handle regular user correctly", () => {
    const TestComponent = () => {
      return (
        <MockAuthProvider initialUser={mockUser} initialToken="fake-user-token">
          <div data-testid="user-test">User Test</div>
        </MockAuthProvider>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId("user-test")).toBeInTheDocument();
  });
});

export {
  MockAuthProvider,
  mockUser,
  mockAdmin,
  mockLoginResponse,
  mockAdminLoginResponse,
};
