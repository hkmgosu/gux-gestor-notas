import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import axios from "axios";
import NotesPage from "../pages/notes";

// Mock dependencies
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("axios");

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
mockUseRouter.mockReturnValue({
  push: mockPush,
  query: {},
  pathname: "/notes",
  asPath: "/notes",
  route: "/notes",
  back: jest.fn(),
  beforePopState: jest.fn(),
  prefetch: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
});

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

// Mock AuthContext with same pattern as AuthorizationFeatures.test.tsx
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface MockAuthProviderProps {
  children: React.ReactElement;
  initialUser: User | null;
  initialToken: string | null;
}

const MockAuthProvider = ({
  children,
  initialUser,
  initialToken,
}: MockAuthProviderProps) => (
  <div data-testid="mock-provider">
    {React.cloneElement(children, {
      "data-mock-user": JSON.stringify(initialUser),
      "data-mock-token": initialToken,
    })}
  </div>
);

// Mock useAuth hook
jest.mock("../app/contexts/AuthContext", () => ({
  useAuth: () => {
    const element = document.querySelector('[data-testid="mock-provider"] > *');
    if (element) {
      const userString = element.getAttribute("data-mock-user");
      const token = element.getAttribute("data-mock-token");
      const user = userString ? JSON.parse(userString) : null;

      return {
        user,
        isAdmin: user?.role === "admin",
        token,
        login: jest.fn(),
        logout: jest.fn(),
      };
    }

    return {
      user: null,
      isAdmin: false,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
    };
  },
}));

describe("Search and Filter Features Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios mock
    (mockedAxios.get as jest.Mock).mockReset();
  });

  describe("Búsqueda por texto", () => {
    it("should show search input for all users", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Buscar por título o contenido...")
        ).toBeInTheDocument();
      });
    });

    it("should show search results counter for regular users", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      const mockNotes = [
        {
          id: 1,
          title: "React Note",
          content: "React content",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Mis notas: 1 \| Compartidas: 0/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Filtros para admin", () => {
    it("should show filter buttons only for admin users", async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Todas")).toBeInTheDocument();
        expect(screen.getByText("Propias")).toBeInTheDocument();
        expect(screen.getByText("Compartidas")).toBeInTheDocument();
        expect(screen.getByText("Públicas")).toBeInTheDocument();
      });
    });

    it("should NOT show filter buttons for regular users", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Regular User",
        role: "user",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="user-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText("Todas")).not.toBeInTheDocument();
        expect(screen.queryByText("Propias")).not.toBeInTheDocument();
        expect(screen.queryByText("Compartidas")).not.toBeInTheDocument();
        expect(screen.queryByText("Públicas")).not.toBeInTheDocument();
      });
    });

    it("should show correct count for admin users", async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      const mockNotes = [
        {
          id: 1,
          title: "Note 1",
          content: "Content 1",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockAdmin,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "Note 2",
          content: "Content 2",
          user_id: 2,
          is_public: true,
          shared_with: [],
          user: { id: 2, email: "user@test.com", name: "User", role: "user" },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Mostrando 2 de 2 notas/)).toBeInTheDocument();
      });
    });
  });

  describe("Interacciones básicas", () => {
    it("should allow typing in search input", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(
          "Buscar por título o contenido..."
        );
        expect(searchInput).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "test search" } });
        expect(searchInput).toHaveValue("test search");
      });
    });

    it("should show search term in results counter", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(
          "Buscar por título o contenido..."
        );
        fireEvent.change(searchInput, { target: { value: "react" } });

        expect(screen.getByText(/Búsqueda: "react"/)).toBeInTheDocument();
      });
    });

    it("should allow admin to click filter buttons", async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const publicasButton = screen.getByText("Públicas");
        fireEvent.click(publicasButton);

        // Verify button is now active (has blue background)
        expect(publicasButton).toHaveClass("bg-orange-600");
      });
    });
  });

  describe("Estados de carga y error", () => {
    it("should show empty state message when no notes found during search", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(
          "Buscar por título o contenido..."
        );
        fireEvent.change(searchInput, { target: { value: "nonexistent" } });

        expect(
          screen.getByText("No se encontraron notas propias con esa búsqueda")
        ).toBeInTheDocument();
      });
    });

    it("should show filter indicator for admin when filter is applied", async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const publicasButton = screen.getByText("Públicas");
        fireEvent.click(publicasButton);

        expect(screen.getByText("Filtro: Públicas")).toBeInTheDocument();
      });
    });
  });
});
