import axios from "axios";
import { FC, useState } from "react";
import { Note } from "../../../types";

interface Props {
  note: Note;
  onClose: () => void;
}

const ShareNoteModal: FC<Props> = ({ note, onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/notes/${note.id}/share`,
        { email },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(`Nota compartida exitosamente con ${email}`);
      setEmail("");
      setIsShared(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage("Error al compartir la nota");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Compartir nota: {note.title}</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              isShared
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {!isShared ? (
          <>
            <div className="mb-4">
              <label className="block mb-1">Email del usuario</label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={!email.trim()}
              >
                Compartir
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareNoteModal;
