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

describe("Notes Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock authenticated user
    localStorage.setItem("token", "fake-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      })
    );
  });

  it("renders notes page with proper sections", async () => {
    // Mock API responses
    mockedAxios.get.mockImplementation((url) => {
      if (url === "http://127.0.0.1:8000/api/notes") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: "My Note",
              content: "Note content",
              user_id: 1,
              user: { id: 1, name: "Test User", email: "test@example.com" },
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MockAuthProvider>
        <NotesPage />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Notas")).toBeDefined();
      expect(screen.getByText("Mis Notas")).toBeDefined();
      expect(screen.getByText("Notas Compartidas conmigo")).toBeDefined();
    });
  });

  it("displays notes when loaded", async () => {
    // Mock API responses
    mockedAxios.get.mockImplementation((url) => {
      if (url === "http://127.0.0.1:8000/api/notes") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: "Test Note",
              content: "This is a test note",
              user_id: 1,
              user: { id: 1, name: "Test User", email: "test@example.com" },
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MockAuthProvider>
        <NotesPage />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Note")).toBeDefined();
      expect(screen.getByText("This is a test note")).toBeDefined();
    });
  });

  it("allows users to edit notes shared with them", async () => {
    // Set user with shared note access
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 2,
        name: "Shared User",
        email: "shared@example.com",
        role: "user",
      })
    );
    localStorage.setItem("token", "fake-jwt-token-shared");

    // Mock API responses for shared user
    mockedAxios.get.mockImplementation((url) => {
      if (url === "http://127.0.0.1:8000/api/notes") {
        return Promise.resolve({
          data: [
            {
              id: 3,
              title: "Nota Compartida",
              content:
                "Esta nota está compartida con otros usuarios y pueden editarla",
              is_public: false,
              shared_with: ["shared@example.com", "test@example.com"],
              owner_email: "owner@example.com",
              user: { id: 4, name: "Owner", email: "owner@example.com" },
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MockAuthProvider>
        <NotesPage />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Notas Compartidas conmigo")).toBeDefined();
      expect(screen.getByText("Nota Compartida")).toBeDefined();
    });

    // Verify that edit and share buttons are present for shared notes
    await waitFor(() => {
      expect(screen.getByText("Editar")).toBeDefined();
      expect(screen.getByText("Compartir")).toBeDefined();
    });
  });

  it("shows empty state when no notes exist", async () => {
    // Mock empty API responses
    mockedAxios.get.mockImplementation((url) => {
      if (url === "http://127.0.0.1:8000/api/notes") {
        return Promise.resolve({
          data: [],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MockAuthProvider>
        <NotesPage />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No tienes notas creadas")).toBeDefined();
      expect(screen.getByText("No tienes notas compartidas")).toBeDefined();
    });
  });

  it("allows creating a new note", async () => {
    // Mock API responses
    mockedAxios.get.mockImplementation((url) => {
      if (url === "http://127.0.0.1:8000/api/notes") {
        return Promise.resolve({
          data: [],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 1,
        title: "New Note",
        content: "New note content",
        user_id: 1,
        user: { id: 1, name: "Test User", email: "test@example.com" },
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      },
    });

    render(
      <MockAuthProvider>
        <NotesPage />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Crear Nota")).toBeDefined();
    });

    // Click the "Crear Nota" button to show the form
    const createButton = screen.getByRole("button", { name: "Crear Nota" });
    fireEvent.click(createButton);

    // Wait for the form to appear and then fill it
    await waitFor(() => {
      expect(screen.getByLabelText("Título")).toBeDefined();
    });

    // Fill and submit form
    const titleInput = screen.getByLabelText("Título");
    const contentInput = screen.getByLabelText("Contenido");
    const submitButton = screen.getByRole("button", { name: "Guardar" });

    fireEvent.change(titleInput, { target: { value: "New Note" } });
    fireEvent.change(contentInput, { target: { value: "New note content" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/notes",
        {
          title: "New Note",
          content: "New note content",
          is_public: false,
          shared_with: [],
        },
        expect.any(Object)
      );
    });
  });

  it("displays admin section for admin users", async () => {
    // Set admin user
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      })
    );

    // Mock API responses for admin
    mockedAxios.get.mockImplementation((url) => {
      if (url === "http://127.0.0.1:8000/api/notes") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: "User Note",
              content: "A note from a user",
              user_id: 2,
              user: { id: 2, name: "Regular User", email: "user@example.com" },
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MockAuthProvider>
        <NotesPage />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Todas las Notas del Sistema")).toBeDefined();
      expect(screen.getByText("User Note")).toBeDefined();
      expect(
        screen.getByText((content) => {
          return content.includes("Dueño: user@example.com");
        })
      ).toBeDefined();
    });
  });
});
