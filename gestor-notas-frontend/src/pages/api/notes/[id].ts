import { NextApiRequest, NextApiResponse } from 'next';

interface Note {
  id: number;
  title: string;
  content: string;
  is_public: boolean;
  shared_with: string[];
  owner_email: string;
}

// Mock data store (same as in index.ts - in production, this would be a database)
const mockNotes: Note[] = [
  {
    id: 1,
    title: "Nota de Ejemplo",
    content: "Esta es una nota de ejemplo para demostrar la funcionalidad",
    is_public: false,
    shared_with: [],
    owner_email: "user@example.com",
  },
  {
    id: 2,
    title: "Nota Pública",
    content: "Esta nota es pública y todos pueden verla",
    is_public: true,
    shared_with: [],
    owner_email: "admin@domain.com",
  },
  {
    id: 3,
    title: "Nota Compartida",
    content: "Esta nota está compartida con otros usuarios y pueden editarla",
    is_public: false,
    shared_with: ["shared@example.com", "test@example.com"],
    owner_email: "owner@example.com",
  },
];

function getAuthHeader(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function getUserFromToken(token: string) {
  if (!token || !token.startsWith('fake-jwt-token-')) {
    return null;
  }
  
  // Extract user info from token (in real app, decode JWT token)
  if (token === 'fake-jwt-token-user') {
    return {
      id: 1,
      email: "user@example.com",
      role: "user"
    };
  } else if (token === 'fake-jwt-token-shared') {
    return {
      id: 2,
      email: "shared@example.com",
      role: "user"
    };
  } else if (token === 'fake-jwt-token-admin') {
    return {
      id: 3,
      email: "admin@example.com",
      role: "admin"
    };
  }
  
  // Default fallback
  return {
    id: 1,
    email: "user@example.com",
    role: "user"
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const noteId = parseInt(id as string);

  const token = getAuthHeader(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = getUserFromToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  const noteIndex = mockNotes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const note = mockNotes[noteIndex];

  // Check permissions: admin, owner, or user with whom the note is shared
  const isAdmin = user.role === 'admin';
  const isOwner = note.owner_email === user.email;
  const isSharedWithUser = note.shared_with && note.shared_with.includes(user.email);
  
  if (!isAdmin && !isOwner && !isSharedWithUser) {
    return res.status(403).json({ message: 'Acceso denegado. No tienes permisos para editar esta nota.' });
  }

  switch (req.method) {
    case 'PUT':
      const { title, content, is_public } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const updatedNote = {
        ...note,
        title,
        content,
        is_public: is_public || false,
      };

      mockNotes[noteIndex] = updatedNote;
      return res.status(200).json(updatedNote);

    case 'DELETE':
      mockNotes.splice(noteIndex, 1);
      return res.status(204).end();

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
