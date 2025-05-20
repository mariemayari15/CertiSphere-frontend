interface LoginResponse {
    token: string;
    message?: string;
    error?: string;
  }
  
  export async function login(clientCode: string, password: string): Promise<LoginResponse> {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientCode, password }),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
  
    return data; 
  }
  
  export async function requestPasswordReset(clientCode: string): Promise<{ message: string }> {
    const response = await fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientCode }),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error sending reset request');
    }
  
    return data;
  }
  
  export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch('http://localhost:5000/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error resetting password');
    }
  
    return data;
  }
  export async function requestPasswordChange(oldPassword: string, token: string) {
    const res = await fetch('http://localhost:5000/api/change-password-request', {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }
  


export async function loginClient(clientCode: string, password: string): Promise<string> {
  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientCode, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data.token;
}


export interface ContactName {
  firstName: string;
  lastName: string;
}

export interface RegisterFormData {
  businessName: string;
  businessType: string;
  industry: string;
  contactName: ContactName;
  title: string;
  contactEmail: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export async function registerClient(formData: RegisterFormData): Promise<void> {
  const res = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
}
