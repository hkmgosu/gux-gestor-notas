import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotesPage from "../pages/notes";
import { MockAuthProvider } from "./AuthContext.test";
import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
}));

// Define mock users for tests
const mockOwner = {
  id: 1,
  name: "Owner User",
  email: "owner@example.com",
  role: "user" as const,
};

const mockCollaborator = {
  id: 2,
  name: "Collaborator User",
  email: "collaborator@example.com",
  role: "user" as const,
};

const mockUnauthorized = {
  id: 3,
  name: "Unauthorized User",
  email: "unauthorized@example.com",
  role: "user" as const,
};

const mockAnyUser = {
  id: 3,
  name: "Any User",
  email: "anyuser@example.com",
  role: "user" as const,
};

const mockNonOwner = {
  id: 3,
  name: "Non Owner",
  email: "nonowner@example.com",
  role: "user" as const,
};

const mockAdmin = {
  id: 1,
  name: "Admin User",
  email: "admin@example.com",
  role: "admin" as const,
};

const mockRegularUser = {
  id: 2,
  name: "Regular User",
  email: "user@example.com",
  role: "user" as const,
};

describe("Authorization Features Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("1. Solo el autor o usuarios con los que fue compartida pueden ver/editar la nota", () => {
    it("should allow owner to see and edit their private note", async () => {
      // Mock usuario propietario
      localStorage.setItem("token", "owner-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          name: "Owner User",
          email: "owner@example.com",
          role: "user",
        })
      );

      const privateNote = {
        id: 1,
        title: "Private Note",
        content: "Private content",
        user_id: 1,
        is_public: false,
        shared_with: [],
        user: {
          id: 1,
          name: "Owner User",
          email: "owner@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockedAxios.get.mockResolvedValue({ data: [privateNote] });

      render(
        <MockAuthProvider initialUser={mockOwner} initialToken="owner-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Private Note")).toBeInTheDocument();
        expect(screen.getByText("Editar")).toBeInTheDocument();
      });
    });

    it("should allow collaborator to see and edit shared note", async () => {
      // Mock usuario colaborador
      localStorage.setItem("token", "collaborator-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 2,
          name: "Collaborator User",
          email: "collaborator@example.com",
          role: "user",
        })
      );

      const sharedNote = {
        id: 1,
        title: "Shared Note",
        content: "Shared content",
        user_id: 1,
        is_public: false,
        shared_with: ["collaborator@example.com"],
        user: {
          id: 1,
          name: "Owner User",
          email: "owner@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockedAxios.get.mockResolvedValue({ data: [sharedNote] });

      render(
        <MockAuthProvider
          initialUser={mockCollaborator}
          initialToken="collaborator-token"
        >
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Shared Note")).toBeInTheDocument();
        expect(screen.getByText("Editar")).toBeInTheDocument();
      });
    });

    it("should NOT allow unauthorized user to see private note", async () => {
      // Mock usuario sin permisos
      localStorage.setItem("token", "unauthorized-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 3,
          name: "Unauthorized User",
          email: "unauthorized@example.com",
          role: "user",
        })
      );

      const privateNote = {
        id: 1,
        title: "Private Note",
        content: "Private content",
        user_id: 1,
        is_public: false,
        shared_with: [],
        user: {
          id: 1,
          name: "Owner User",
          email: "owner@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      // El backend filtraría esta nota, por lo que no debería aparecer
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(
        <MockAuthProvider
          initialUser={mockUnauthorized}
          initialToken="unauthorized-token"
        >
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText("Private Note")).not.toBeInTheDocument();
        expect(screen.getByText("No tienes notas creadas")).toBeInTheDocument();
      });
    });
  });

  describe("2. Si la nota es pública, cualquier usuario autenticado puede verla, pero no editarla", () => {
    it("should allow any authenticated user to see public note", async () => {
      // Mock usuario sin permisos
      localStorage.setItem("token", "user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 3,
          name: "Any User",
          email: "anyuser@example.com",
          role: "user",
        })
      );

      const publicNote = {
        id: 1,
        title: "Public Note",
        content: "Public content",
        user_id: 1,
        is_public: true,
        shared_with: [],
        user: {
          id: 1,
          name: "Owner User",
          email: "owner@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockedAxios.get.mockResolvedValue({ data: [publicNote] });

      render(
        <MockAuthProvider
          initialUser={{
            id: 3,
            name: "Any User",
            email: "anyuser@example.com",
            role: "user" as const,
          }}
          initialToken="user-token"
        >
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Public Note")).toBeInTheDocument();
        expect(screen.getByText(/Pública/)).toBeInTheDocument();
      });
    });

    it("should NOT allow non-owner to edit public note", async () => {
      // Mock usuario que no es dueño
      localStorage.setItem("token", "user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 3,
          name: "Non Owner",
          email: "nonowner@example.com",
          role: "user",
        })
      );

      const publicNote = {
        id: 1,
        title: "Public Note",
        content: "Public content",
        user_id: 1,
        is_public: true,
        shared_with: [],
        user: {
          id: 1,
          name: "Owner User",
          email: "owner@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockedAxios.get.mockResolvedValue({ data: [publicNote] });

      render(
        <MockAuthProvider
          initialUser={{
            id: 3,
            name: "Non Owner",
            email: "nonowner@example.com",
            role: "user" as const,
          }}
          initialToken="user-token"
        >
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Public Note")).toBeInTheDocument();
        // No debería haber botón de editar para usuarios no autorizados
        expect(screen.queryByText("Editar")).not.toBeInTheDocument();
      });
    });
  });

  describe("3. Admin puede ver y eliminar cualquier nota", () => {
    it("should allow admin to see all notes in system", async () => {
      // Mock usuario admin
      localStorage.setItem("token", "admin-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        })
      );

      const allNotes = [
        {
          id: 1,
          title: "User Note 1",
          content: "Content 1",
          user_id: 2,
          is_public: false,
          shared_with: [],
          user: {
            id: 2,
            name: "User 1",
            email: "user1@example.com",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "User Note 2",
          content: "Content 2",
          user_id: 3,
          is_public: true,
          shared_with: [],
          user: {
            id: 3,
            name: "User 2",
            email: "user2@example.com",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: allNotes });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Notas (Admin)")).toBeInTheDocument();
        expect(
          screen.getByText("Todas las Notas del Sistema")
        ).toBeInTheDocument();
        expect(screen.getByText("User Note 1")).toBeInTheDocument();
        expect(screen.getByText("User Note 2")).toBeInTheDocument();
        // Admin debe poder editar y eliminar cualquier nota
        expect(screen.getAllByText("Editar")).toHaveLength(2);
        expect(screen.getAllByText("Eliminar")).toHaveLength(2);
      });
    });

    it("should allow admin to edit any note", async () => {
      // Mock usuario admin
      localStorage.setItem("token", "admin-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        })
      );

      const userNote = {
        id: 1,
        title: "User Note",
        content: "User content",
        user_id: 2,
        is_public: false,
        shared_with: [],
        user: {
          id: 2,
          name: "Regular User",
          email: "user@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockedAxios.get.mockResolvedValue({ data: [userNote] });
      mockedAxios.put.mockResolvedValue({
        data: { ...userNote, title: "Edited by Admin" },
      });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("User Note")).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByText("Editar"));

      await waitFor(() => {
        expect(screen.getByDisplayValue("User Note")).toBeInTheDocument();
      });
    });
  });

  describe("4. Si el usuario es admin, ver todas las notas existentes", () => {
    it("should show admin all notes in main section, not shared section", async () => {
      // Mock usuario admin
      localStorage.setItem("token", "admin-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        })
      );

      const allNotes = [
        {
          id: 1,
          title: "Private Note",
          content: "Private content",
          user_id: 2,
          is_public: false,
          shared_with: [],
          user: {
            id: 2,
            name: "User 1",
            email: "user1@example.com",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
        {
          id: 2,
          title: "Public Note",
          content: "Public content",
          user_id: 3,
          is_public: true,
          shared_with: [],
          user: {
            id: 3,
            name: "User 2",
            email: "user2@example.com",
            role: "user",
          },
          created_at: "2024-01-01T00:00:00.000000Z",
          updated_at: "2024-01-01T00:00:00.000000Z",
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: allNotes });

      render(
        <MockAuthProvider initialUser={mockAdmin} initialToken="admin-token">
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        // Admin ve título especial
        expect(
          screen.getByText("Todas las Notas del Sistema")
        ).toBeInTheDocument();
        // Admin ve todas las notas
        expect(screen.getByText("Private Note")).toBeInTheDocument();
        expect(screen.getByText("Public Note")).toBeInTheDocument();
        // Admin NO ve sección de "Notas Compartidas conmigo"
        expect(
          screen.queryByText("Notas Compartidas conmigo")
        ).not.toBeInTheDocument();
      });
    });

    it("should show regular user only their own and shared notes in separate sections", async () => {
      // Mock usuario regular
      localStorage.setItem("token", "user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 2,
          name: "Regular User",
          email: "user@example.com",
          role: "user",
        })
      );

      const ownNote = {
        id: 1,
        title: "My Note",
        content: "My content",
        user_id: 2,
        is_public: false,
        shared_with: [],
        user: {
          id: 2,
          name: "Regular User",
          email: "user@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      const sharedNote = {
        id: 2,
        title: "Shared Note",
        content: "Shared content",
        user_id: 1,
        is_public: false,
        shared_with: ["user@example.com"],
        user: {
          id: 1,
          name: "Other User",
          email: "other@example.com",
          role: "user",
        },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockedAxios.get.mockResolvedValue({ data: [ownNote, sharedNote] });

      render(
        <MockAuthProvider
          initialUser={mockRegularUser}
          initialToken="user-token"
        >
          <NotesPage />
        </MockAuthProvider>
      );

      await waitFor(() => {
        // Usuario regular ve título normal
        expect(screen.getByText("Mis Notas")).toBeInTheDocument();
        // Usuario regular ve sección de compartidas
        expect(
          screen.getByText("Notas Compartidas conmigo")
        ).toBeInTheDocument();
        // Ve ambas notas
        expect(screen.getByText("My Note")).toBeInTheDocument();
        expect(screen.getByText("Shared Note")).toBeInTheDocument();
      });
    });
  });
});
