import { FC } from "react";
import { Note } from "../../../types";

interface Props {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

const NoteCard: FC<Props> = ({ note, onEdit, onDelete, onShare }) => {
  // Debug: log the note to see what fields we're getting
  console.log("Datos de nota en NoteCard:", note);

  // Get owner email from the user object
  const ownerEmail = note.user?.email || "Unknown";

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-3 text-center">{note.title}</h3>
      <p className="mb-4 text-gray-700 text-center leading-relaxed">
        {note.content}
      </p>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {note.is_public ? "Pública" : "Privada"}
        {` | Dueño: ${ownerEmail}`}
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 text-sm"
          >
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="bg-red-400 px-2 py-1 rounded hover:bg-red-500 text-sm"
          >
            Eliminar
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="bg-green-400 px-2 py-1 rounded hover:bg-green-500 text-sm"
          >
            Compartir
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
