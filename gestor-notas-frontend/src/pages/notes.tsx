import { useEffect, useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";
import axios from "axios";
import NoteCard from "../app/components/Notes/NoteCard";
import NoteForm from "../app/components/Notes/NoteForm";
import ShareNoteModal from "../app/components/Shared/ShareNoteModal";
import { useRouter } from "next/router";
import { Note } from "../types";

export default function NotesPage() {
  const { user, isAdmin, token, logout } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "own" | "shared" | "public"
  >("all");

  // Función para filtrar y buscar notas
  const filterNotes = (notesArray: Note[]) => {
    let filteredNotes = [...notesArray];

    // Aplicar filtro de búsqueda por texto
    if (searchTerm.trim()) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros por tipo (solo para admins o vista combinada)
    if (user?.role === "admin" && selectedFilter !== "all") {
      switch (selectedFilter) {
        case "own":
          filteredNotes = filteredNotes.filter(
            (note) =>
              note.user?.email === user?.email || note.user_id === user?.id
          );
          break;
        case "shared":
          filteredNotes = filteredNotes.filter(
            (note) =>
              note.shared_with?.includes(user?.email || "") &&
              note.user?.email !== user?.email
          );
          break;
        case "public":
          filteredNotes = filteredNotes.filter((note) => note.is_public);
          break;
      }
    }

    return filteredNotes;
  };

  // Función para obtener todas las notas para vista combinada (solo admin)
  const getAllNotesForAdmin = () => {
    if (user?.role !== "admin") return [];
    return filterNotes([...notes]);
  };

  // Función para obtener notas propias filtradas
  const getOwnNotesFiltered = () => {
    if (user?.role === "admin") return [];
    return filterNotes(notes);
  };

  // Función para obtener notas compartidas filtradas
  const getSharedNotesFiltered = () => {
    if (user?.role === "admin") return [];
    return filterNotes(sharedNotes);
  };

  // Helper function to determine if user can edit a note
  const canEditNote = (note: Note): boolean => {
    if (!user) return false;

    // Admin can edit any note
    if (user.role === "admin") return true;

    // Owner can edit their own notes
    const isOwner = note.user?.email === user.email || note.user_id === user.id;
    if (isOwner) return true;

    // User can edit notes shared with them
    const isSharedWithUser = note.shared_with?.includes(user.email || "");
    return isSharedWithUser || false;
  };

  const fetchNotes = async () => {
    // Don't fetch if no token is available
    if (!token) {
      console.log("No hay token disponible, redirigiendo al login");
      router.push("/login");
      return;
    }

    try {
      console.log("Obteniendo notas con token:", token);
      const response = await axios.get("http://127.0.0.1:8000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allNotes = response.data;
      console.log("Todas las notas del backend:", allNotes);
      console.log("Email del usuario actual:", user?.email);
      console.log("Rol del usuario actual:", user?.role);

      // Separate owned notes from shared notes
      const ownedNotes = allNotes.filter((note: Note) => {
        // A note is owned if the user.email matches current user OR user_id matches
        const isOwnerByEmail = note.user?.email === user?.email;
        const isOwnerById = note.user_id === user?.id;

        console.log(
          `Nota ${note.id}: user.email=${note.user?.email}, user_id=${note.user_id}, isOwnerByEmail=${isOwnerByEmail}, isOwnerById=${isOwnerById}`
        );

        return isOwnerByEmail || isOwnerById;
      });

      const shared = allNotes.filter((note: Note) => {
        // A note is shared with me if:
        // 1. My email is explicitly in the shared_with array OR
        // 2. It's a public note that doesn't belong to me OR
        // 3. If I'm admin, show all notes that aren't mine
        const isSharedWithMe = note.shared_with?.includes(user?.email || "");
        const isPublicNotMine =
          note.is_public && note.user?.email !== user?.email;
        const isAdminViewingOthers =
          user?.role === "admin" && note.user?.email !== user?.email;

        console.log(
          `Nota ${note.id} verificación compartida: isSharedWithMe=${isSharedWithMe}, isPublicNotMine=${isPublicNotMine}, isAdminViewingOthers=${isAdminViewingOthers}`
        );
        console.log(`  - note.shared_with:`, note.shared_with);
        console.log(`  - user.email:`, user?.email);
        console.log(`  - note.user.email:`, note.user?.email);

        return isSharedWithMe || isPublicNotMine || isAdminViewingOthers;
      });

      // If user is admin, they can see all notes
      if (user?.role === "admin") {
        console.log("Usuario admin - mostrando TODAS las notas");
        console.log("Todas las notas para admin:", allNotes);

        // Admin sees ALL notes in the main section
        setNotes(allNotes);
        setSharedNotes([]); // Empty shared notes section for admin
      } else {
        console.log("Usuario regular - filtrado normal");
        console.log("Notas propias:", ownedNotes);
        console.log("Notas compartidas:", shared);

        setNotes(ownedNotes);
        setSharedNotes(shared);
      }
    } catch (error) {
      console.error("Error obteniendo notas:", error);

      // Handle 401 Unauthorized - token expired or invalid
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Autenticación fallida, redirigiendo al login");
        logout(); // Clear invalid token
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    if (!user || !token) {
      console.log("Faltan usuario o token:", { user: !!user, token: !!token });
      return;
    }
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, token]);

  const handleCreate = () => {
    setCurrentNote(null);
    setShowForm(true);
  };

  const handleEdit = (note: Note) => {
    setCurrentNote(note);
    setShowForm(true);
  };

  const handleDelete = async (noteId: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh notes to ensure proper state
      await fetchNotes();
    } catch (error) {
      console.error("Error eliminando nota:", error);
    }
  };

  const handleSave = async (noteData: Partial<Note>) => {
    try {
      if (noteData.id) {
        // Editar
        const fullNote = { ...currentNote, ...noteData } as Note;
        await axios.put(
          `http://127.0.0.1:8000/api/notes/${noteData.id}`,
          fullNote,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Refresh notes to get updated data from backend
        await fetchNotes();
      } else {
        // Crear
        await axios.post("http://127.0.0.1:8000/api/notes", noteData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refresh notes to get the new note with complete user information
        await fetchNotes();
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error guardando nota:", error);
    }
  };

  const handleShare = (note: Note) => {
    setNoteToShare(note);
    setShowShareModal(true);
  };

  const handleLogout = () => {
    // usar contexto logout
    // en _app.tsx se envuelve en AuthProvider
    logout();
    // Redirigir a login
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Notas {isAdmin ? "(Admin)" : ""}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
        <div className="mb-6 text-center lg:text-left">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Crear Nota
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Barra de búsqueda */}
            <div className="flex-1 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Buscar por título o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros por tipo (solo para admin) */}
            {user?.role === "admin" && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSelectedFilter("own")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === "own"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Propias
                </button>
                <button
                  onClick={() => setSelectedFilter("shared")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === "shared"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Compartidas
                </button>
                <button
                  onClick={() => setSelectedFilter("public")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === "public"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Públicas
                </button>
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="mt-3 text-sm text-gray-600">
            {user?.role === "admin" ? (
              <>
                Mostrando {getAllNotesForAdmin().length} de {notes.length} notas
                {selectedFilter !== "all" && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    Filtro:{" "}
                    {selectedFilter === "own"
                      ? "Propias"
                      : selectedFilter === "shared"
                      ? "Compartidas"
                      : selectedFilter === "public"
                      ? "Públicas"
                      : "Todas"}
                  </span>
                )}
              </>
            ) : (
              <>
                Mis notas: {getOwnNotesFiltered().length} | Compartidas:{" "}
                {getSharedNotesFiltered().length}
              </>
            )}
            {searchTerm && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Búsqueda: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center lg:text-left">
            {user?.role === "admin"
              ? "Todas las Notas del Sistema"
              : "Mis Notas"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {user?.role === "admin" ? (
              getAllNotesForAdmin().length > 0 ? (
                getAllNotesForAdmin().map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleEdit(note)}
                    onDelete={() => handleDelete(note.id)}
                    onShare={() => handleShare(note)}
                  />
                ))
              ) : (
                <div className="col-span-full bg-white p-8 rounded shadow text-center text-gray-500">
                  <p className="text-lg mb-2">
                    {searchTerm || selectedFilter !== "all"
                      ? "No se encontraron notas con los filtros aplicados"
                      : "No hay notas en el sistema"}
                  </p>
                  <p className="text-sm">
                    {searchTerm || selectedFilter !== "all"
                      ? "Prueba cambiar los filtros de búsqueda"
                      : "Cuando se creen notas en el sistema, aparecerán aquí"}
                  </p>
                </div>
              )
            ) : getOwnNotesFiltered().length > 0 ? (
              getOwnNotesFiltered().map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => handleEdit(note)}
                  onDelete={() => handleDelete(note.id)}
                  onShare={() => handleShare(note)}
                />
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded shadow text-center text-gray-500">
                <p className="text-lg mb-2">
                  {searchTerm
                    ? "No se encontraron notas propias con esa búsqueda"
                    : "No tienes notas creadas"}
                </p>
                <p className="text-sm">
                  {searchTerm
                    ? "Prueba con otros términos de búsqueda"
                    : 'Haz clic en "Crear Nota" para comenzar'}
                </p>
              </div>
            )}
          </div>
        </div>
        {user?.role !== "admin" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-center lg:text-left">
              Notas Compartidas conmigo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {getSharedNotesFiltered().length > 0 ? (
                getSharedNotesFiltered().map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={
                      canEditNote(note) ? () => handleEdit(note) : undefined
                    }
                    onShare={
                      canEditNote(note) ? () => handleShare(note) : undefined
                    }
                  />
                ))
              ) : (
                <div className="col-span-full bg-white p-8 rounded shadow text-center text-gray-500">
                  <p className="text-lg mb-2">
                    {searchTerm
                      ? "No se encontraron notas compartidas con esa búsqueda"
                      : "No tienes notas compartidas"}
                  </p>
                  <p className="text-sm">
                    {searchTerm
                      ? "Prueba con otros términos de búsqueda"
                      : "Las notas que otros usuarios compartan contigo aparecerán aquí"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <NoteForm
            onClose={() => setShowForm(false)}
            onSave={handleSave}
            note={currentNote}
          />
        )}

        {showShareModal && noteToShare && (
          <ShareNoteModal
            note={noteToShare}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </div>
  );
}
