import { render, screen, fireEvent } from "@testing-library/react";
import NoteCard from "../app/components/Notes/NoteCard";
import { Note } from "../types";

const mockNote: Note = {
  id: 1,
  user_id: 1,
  title: "Test Note",
  content: "This is a test note content",
  is_public: false,
  shared_with: ["admin@example.com"],
  created_at: "2025-01-01T00:00:00.000000Z",
  updated_at: "2025-01-01T00:00:00.000000Z",
  user: {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "user",
  },
};

const mockPublicNote: Note = {
  ...mockNote,
  id: 2,
  title: "Public Note",
  is_public: true,
};

describe("NoteCard", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders note information correctly", () => {
    render(<NoteCard note={mockNote} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a test note content")).toBeInTheDocument();
    expect(screen.getByText(/Privada/)).toBeInTheDocument();
    expect(screen.getByText(/Dueño: test@example.com/)).toBeInTheDocument();
  });

  it("shows public status for public notes", () => {
    render(<NoteCard note={mockPublicNote} />);

    expect(screen.getByText(/Pública/)).toBeInTheDocument();
  });

  it("renders action buttons when callbacks are provided", () => {
    render(
      <NoteCard
        note={mockNote}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
    expect(screen.getByText("Compartir")).toBeInTheDocument();
  });

  it("does not render action buttons when callbacks are not provided", () => {
    render(<NoteCard note={mockNote} />);

    expect(screen.queryByText("Editar")).not.toBeInTheDocument();
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
    expect(screen.queryByText("Compartir")).not.toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<NoteCard note={mockNote} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText("Editar"));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByText("Eliminar"));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("calls onShare when share button is clicked", () => {
    render(<NoteCard note={mockNote} onShare={mockOnShare} />);

    fireEvent.click(screen.getByText("Compartir"));
    expect(mockOnShare).toHaveBeenCalledTimes(1);
  });

  it("handles missing user information gracefully", () => {
    const noteWithoutUser = {
      ...mockNote,
      user: undefined,
    } as any;

    render(<NoteCard note={noteWithoutUser} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText(/Dueño: Unknown/)).toBeInTheDocument();
  });
});
