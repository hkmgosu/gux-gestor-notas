export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  is_public: boolean;
  shared_with: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}
