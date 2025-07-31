import { NextApiRequest, NextApiResponse } from 'next';

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
    return res.status(401).json({ message: 'No autorizado' });
  }

  const user = getUserFromToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  if (req.method === 'POST') {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Mock sharing logic
    // In production, you would add the email to the note's shared_with array
    return res.status(200).json({ 
      message: `Nota ${noteId} compartida con ${email}` 
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
