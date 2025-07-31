import { FC, useState } from "react";
import { Note } from "../../../types";

interface Props {
  note?: Note | null;
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
}

const NoteForm: FC<Props> = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isPublic, setIsPublic] = useState(note?.is_public || false);
  const [sharedWith, setSharedWith] = useState<string[]>(
    note?.shared_with || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Partial<Note> = {
      title,
      content,
      is_public: isPublic,
      shared_with: sharedWith,
    };

    if (note?.id) {
      newNote.id = note.id;
    }

    onSave(newNote);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded w-full max-w-lg shadow-lg overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">
          {note ? "Editar Nota" : "Nueva Nota"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1">
              Título
            </label>
            <input
              id="title"
              type="text"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block mb-1">
              Contenido
            </label>
            <textarea
              id="content"
              className="w-full border p-2 rounded"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span> Pública</span>
            </label>
          </div>
          {/* Aquí puedes agregar campo para compartir con email */}
          {/* En esta versión, compartiremos por modal */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
