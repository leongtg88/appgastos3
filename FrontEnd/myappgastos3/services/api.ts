const API_URL = 'https://vtowxdsg1m.execute-api.us-east-2.amazonaws.com/ApiRestGastos';

export const api = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  async getExpenses(token: string) {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async createExpense(token: string, expense: any) {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expense),
    });
    return response.json();
  },

  async updateExpense(token: string, expenseId: string, expense: any) {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expenseId, ...expense }),
    });
    return response.json();
  },

  async deleteExpense(token: string, expenseId: string) {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expenseId }),
    });
    return response.json();
  },

  async getReports(token: string, period: string = 'monthly') {
    const response = await fetch(`${API_URL}/expenses/reports?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
