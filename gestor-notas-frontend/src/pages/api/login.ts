import { NextApiRequest, NextApiResponse } from 'next';

// Mock user database - In production, this would be your Laravel backend database
const mockUsers = [
  {
    id: 1,
    email: "admin@domain.com",
    password: "admin123", // In production, this would be hashed
    role: "admin" as const
  },
  {
    id: 2,
    email: "user@example.com", 
    password: "user123", // In production, this would be hashed
    role: "user" as const
  },
  {
    id: 3,
    email: "test@test.com",
    password: "test123", // In production, this would be hashed
    role: "user" as const
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user in mock database
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
  }

  // Validate password (in production, compare with hashed password)
  if (user.password !== password) {
    return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
  }

  // Generate token (in production, use proper JWT)
  const token = "jwt-token-" + user.id + "-" + Date.now();

  // Return user data without password
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  res.status(200).json({
    token,
    user: userWithoutPassword,
  });
}
