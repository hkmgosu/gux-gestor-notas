import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import NotesPage from "../pages/notes";

// Mock dependencies
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
mockUseRouter.mockReturnValue({
  push: mockPush,
  query: {},
  pathname: "/notes",
  asPath: "/notes",
  route: "/notes",
  basePath: "",
  locale: undefined,
  locales: undefined,
  defaultLocale: undefined,
  domainLocales: undefined,
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

// Mock AuthContext
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
}: MockAuthProviderProps) => {
  const mockAuthValue = {
    user: initialUser,
    isAdmin: initialUser?.role === "admin",
    token: initialToken,
    login: jest.fn(),
    logout: jest.fn(),
  };

  return React.cloneElement(children, { mockAuthValue });
};

// Mock useAuth hook
jest.mock("../app/contexts/AuthContext", () => ({
  useAuth: () => {
    // Return a default mock that will be overridden by the test setup
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
  const mockAxios = require("axios").default;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockReset();
  });

  describe("Búsqueda por texto", () => {
    it("should filter notes by title when searching", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      const mockNotes = [
        {
          id: 1,
          title: "React Development",
          content: "Learning React hooks",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "JavaScript Notes",
          content: "ES6 features",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("React Development")).toBeInTheDocument();
        expect(screen.getByText("JavaScript Notes")).toBeInTheDocument();
      });

      // Search for "React"
      const searchInput = screen.getByPlaceholderText(
        "Buscar por título o contenido..."
      );
      fireEvent.change(searchInput, { target: { value: "React" } });

      await waitFor(() => {
        expect(screen.getByText("React Development")).toBeInTheDocument();
        expect(screen.queryByText("JavaScript Notes")).not.toBeInTheDocument();
      });
    });

    it("should filter notes by content when searching", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      const mockNotes = [
        {
          id: 1,
          title: "Development Tips",
          content: "React hooks are powerful",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "Programming Notes",
          content: "Python is versatile",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Development Tips")).toBeInTheDocument();
        expect(screen.getByText("Programming Notes")).toBeInTheDocument();
      });

      // Search for "Python"
      const searchInput = screen.getByPlaceholderText(
        "Buscar por título o contenido..."
      );
      fireEvent.change(searchInput, { target: { value: "Python" } });

      await waitFor(() => {
        expect(screen.getByText("Programming Notes")).toBeInTheDocument();
        expect(screen.queryByText("Development Tips")).not.toBeInTheDocument();
      });
    });

    it("should show no results message when search finds nothing", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      const mockNotes = [
        {
          id: 1,
          title: "React Development",
          content: "Learning React hooks",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("React Development")).toBeInTheDocument();
      });

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText(
        "Buscar por título o contenido..."
      );
      fireEvent.change(searchInput, { target: { value: "NonExistent" } });

      await waitFor(() => {
        expect(
          screen.getByText("No se encontraron notas propias con esa búsqueda")
        ).toBeInTheDocument();
        expect(screen.queryByText("React Development")).not.toBeInTheDocument();
      });
    });
  });

  describe("Filtros para admin", () => {
    it("should show filter buttons for admin users", async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      const mockNotes = [
        {
          id: 1,
          title: "Admin Note",
          content: "Admin content",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockAdmin,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

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

      const mockNotes = [
        {
          id: 1,
          title: "User Note",
          content: "User content",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

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

    it('should filter admin notes by "own" filter', async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      const mockNotes = [
        {
          id: 1,
          title: "Admin Own Note",
          content: "Admin content",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockAdmin,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "Other User Note",
          content: "Other content",
          user_id: 2,
          is_public: false,
          shared_with: [],
          user: {
            id: 2,
            email: "other@test.com",
            name: "Other User",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Admin Own Note")).toBeInTheDocument();
        expect(screen.getByText("Other User Note")).toBeInTheDocument();
      });

      // Click "Propias" filter
      const ownFilter = screen.getByText("Propias");
      fireEvent.click(ownFilter);

      await waitFor(() => {
        expect(screen.getByText("Admin Own Note")).toBeInTheDocument();
        expect(screen.queryByText("Other User Note")).not.toBeInTheDocument();
      });
    });

    it('should filter admin notes by "public" filter', async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      const mockNotes = [
        {
          id: 1,
          title: "Public Note",
          content: "Public content",
          user_id: 2,
          is_public: true,
          shared_with: [],
          user: {
            id: 2,
            email: "other@test.com",
            name: "Other User",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "Private Note",
          content: "Private content",
          user_id: 2,
          is_public: false,
          shared_with: [],
          user: {
            id: 2,
            email: "other@test.com",
            name: "Other User",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Public Note")).toBeInTheDocument();
        expect(screen.getByText("Private Note")).toBeInTheDocument();
      });

      // Click "Públicas" filter
      const publicFilter = screen.getByText("Públicas");
      fireEvent.click(publicFilter);

      await waitFor(() => {
        expect(screen.getByText("Public Note")).toBeInTheDocument();
        expect(screen.queryByText("Private Note")).not.toBeInTheDocument();
      });
    });
  });

  describe("Contador de resultados", () => {
    it("should show correct count for regular user", async () => {
      const mockUser = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        role: "user",
      };

      const mockOwnNotes = [
        {
          id: 1,
          title: "My Note",
          content: "My content",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockUser,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      const mockSharedNotes = [
        {
          id: 2,
          title: "Shared Note",
          content: "Shared content",
          user_id: 2,
          is_public: false,
          shared_with: ["user@test.com"],
          user: {
            id: 2,
            email: "other@test.com",
            name: "Other User",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({
        data: [...mockOwnNotes, ...mockSharedNotes],
      });

      render(
        <MockAuthProvider initialUser={mockUser} initialToken="test-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Mis notas: 1 \| Compartidas: 1/)
        ).toBeInTheDocument();
      });
    });

    it("should show correct count for admin user", async () => {
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

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

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

  describe("Búsqueda combinada con filtros", () => {
    it("should combine search and filter for admin", async () => {
      const mockAdmin = {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      };

      const mockNotes = [
        {
          id: 1,
          title: "React Tutorial",
          content: "Learn React",
          user_id: 1,
          is_public: true,
          shared_with: [],
          user: mockAdmin,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "Python Guide",
          content: "Learn Python",
          user_id: 2,
          is_public: true,
          shared_with: [],
          user: { id: 2, email: "user@test.com", name: "User", role: "user" },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 3,
          title: "React Advanced",
          content: "Advanced React",
          user_id: 1,
          is_public: false,
          shared_with: [],
          user: mockAdmin,
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockNotes });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("React Tutorial")).toBeInTheDocument();
        expect(screen.getByText("Python Guide")).toBeInTheDocument();
        expect(screen.getByText("React Advanced")).toBeInTheDocument();
      });

      // Apply public filter
      const publicFilter = screen.getByText("Públicas");
      fireEvent.click(publicFilter);

      await waitFor(() => {
        expect(screen.getByText("React Tutorial")).toBeInTheDocument();
        expect(screen.getByText("Python Guide")).toBeInTheDocument();
        expect(screen.queryByText("React Advanced")).not.toBeInTheDocument();
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText(
        "Buscar por título o contenido..."
      );
      fireEvent.change(searchInput, { target: { value: "React" } });

      await waitFor(() => {
        expect(screen.getByText("React Tutorial")).toBeInTheDocument();
        expect(screen.queryByText("Python Guide")).not.toBeInTheDocument();
        expect(screen.queryByText("React Advanced")).not.toBeInTheDocument();
      });
    });
  });
});
