import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../pages/register";
import { MockAuthProvider } from "./AuthContext.test";
import axios from "axios";

// Mock axios completely
jest.mock("axios");
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

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders register form", () => {
    render(
      <MockAuthProvider>
        <Register />
      </MockAuthProvider>
    );

    expect(screen.getByRole("heading", { name: "Registro" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: /nombre/i })).toBeDefined();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeDefined();
    expect(screen.getByLabelText("Contraseña")).toBeDefined();
    expect(screen.getByRole("button", { name: "Registrarse" })).toBeDefined();
  });

  it("allows user to type in form fields", () => {
    render(
      <MockAuthProvider>
        <Register />
      </MockAuthProvider>
    );

    const nameInput = screen.getByRole("textbox", {
      name: /nombre/i,
    }) as HTMLInputElement;
    const emailInput = screen.getByRole("textbox", {
      name: /email/i,
    }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      "Contraseña"
    ) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput.value).toBe("Test User");
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("handles successful registration", async () => {
    const mockResponse = {
      data: {
        token: "fake-token",
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <MockAuthProvider>
        <Register />
      </MockAuthProvider>
    );

    const nameInput = screen.getByRole("textbox", { name: /nombre/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Registrarse" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/register",
        {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }
      );
    });
  });

  it("displays error message on registration failure", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: "Email already exists" },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    render(
      <MockAuthProvider>
        <Register />
      </MockAuthProvider>
    );

    const nameInput = screen.getByRole("textbox", { name: /nombre/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Registrarse" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(
          screen.getByText("Ya existe un usuario con este correo electrónico")
        ).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it("has link to login page", () => {
    render(
      <MockAuthProvider>
        <Register />
      </MockAuthProvider>
    );

    const loginLink = screen.getByText("Inicia Sesión");
    expect(loginLink).toBeDefined();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });
});
