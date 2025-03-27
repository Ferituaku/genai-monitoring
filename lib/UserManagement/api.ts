// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5101';

export interface User {
  sso_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string;
}

// User API functions
export const fetchUsersApi = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/users`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const addUserApi = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add user');
  }

  return await response.json();
};

export const updateUserApi = async (sso_id: string, name: string, role: string): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/${sso_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, role }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
  
    return await response.json();
};

export const deleteUserApi = async (sso_id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/${sso_id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user');
  }
};
