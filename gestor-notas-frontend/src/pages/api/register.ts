import { NextApiRequest, NextApiResponse } from 'next';

// Mock user database - same as in login.ts (in production, this would be shared database)
const mockUsers = [
  {
    id: 1,
    email: "admin@domain.com",
    password: "admin123",
    role: "admin" as const
  },
  {
    id: 2,
    email: "user@example.com", 
    password: "user123",
    role: "user" as const
  },
  {
    id: 3,
    email: "test@test.com",
    password: "test123",
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

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(409).json({ message: 'Ya existe un usuario con este correo electrónico' });
  }

  // Create new user (in production, save to database and hash password)
  const newUser = {
    id: Date.now(), // Simple ID generation for mock
    email,
    password, // In production, this would be hashed
    role: "user" as const,
  };

  // Add to mock database (in production, save to real database)
  mockUsers.push(newUser);

  // Generate token
  const token = "jwt-token-" + newUser.id + "-" + Date.now();

  // Return user data without password
  const userWithoutPassword = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role
  };

  res.status(201).json({
    token,
    user: userWithoutPassword,
  });
}
