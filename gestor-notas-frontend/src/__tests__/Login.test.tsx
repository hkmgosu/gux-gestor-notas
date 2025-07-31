import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/login";
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

describe("Login Page", () => {
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

  it("renders login form", () => {
    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );

    expect(
      screen.getByRole("heading", { name: "Iniciar Sesión" })
    ).toBeDefined();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeDefined();
    expect(screen.getByLabelText("Contraseña")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Iniciar Sesión" })
    ).toBeDefined();
  });

  it("shows validation errors for empty fields", async () => {
    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );

    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    const emailInput = screen.getByRole("textbox", {
      name: /email/i,
    }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      "Contraseña"
    ) as HTMLInputElement;

    expect(emailInput.validity.valid).toBe(false);
    expect(passwordInput.validity.valid).toBe(false);
  });

  it("allows user to type in form fields", () => {
    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );

    const emailInput = screen.getByRole("textbox", {
      name: /email/i,
    }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      "Contraseña"
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("handles successful login", async () => {
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
        <Login />
      </MockAuthProvider>
    );

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/login",
        {
          email: "test@example.com",
          password: "password123",
        }
      );
    });
  });

  it("displays error message on login failure", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: "Credenciales inválidas" },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(
          screen.getByText("Correo electrónico o contraseña incorrectos")
        ).toBeDefined();
      },
      { timeout: 3000 }
    );
  });
});
