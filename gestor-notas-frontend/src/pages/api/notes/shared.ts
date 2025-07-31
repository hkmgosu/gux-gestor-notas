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
  const token = getAuthHeader(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = getUserFromToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  if (req.method === 'GET') {
    // Mock shared notes - notes that others have shared with the current user
    const sharedNotes = [
      {
        id: 3,
        title: "Nota Compartida",
        content: "Esta nota fue compartida contigo por otro usuario",
        is_public: false,
        shared_with: [user.email],
        owner_email: "otro@domain.com",
      },
    ];

    return res.status(200).json(sharedNotes);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
