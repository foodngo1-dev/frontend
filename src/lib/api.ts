// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'individual' | 'organization' | 'corporate';
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  donationsCount?: number;
  totalAmountDonated?: number;
  createdAt?: string;
}

export interface Donation {
  _id: string;
  donationId: string;
  donor: User | string;
  type: 'food' | 'monetary' | 'supplies';
  foodItem?: string;
  quantity?: string;
  bestBefore?: string;
  amount?: number;
  paymentMethod?: 'upi' | 'bank' | 'card' | 'cash';
  purpose?: 'general' | 'meals' | 'fleet' | 'training' | 'awareness';
  location?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  notes?: string;
  status: 'pending' | 'pickup-scheduled' | 'in-transit' | 'quality-check' | 'delivered' | 'completed' | 'cancelled';
  recipient?: {
    name?: string;
    type?: string;
    location?: string;
  };
  timeline?: {
    status: string;
    title: string;
    description: string;
    timestamp: string;
  }[];
  createdAt: string;
  deliveredAt?: string;
}

export interface Payment {
  _id: string;
  paymentId: string;
  amount: number;
  status: 'created' | 'attempted' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'upi' | 'bank' | 'card' | 'cash';
  donationType?: string;
  receipt?: string;
  receiptId?: string;
  donation?: {
    donationId: string;
  };
  createdAt: string;
  paidAt?: string;
}

export interface Contact {
  _id: string;
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error: any) {
    // Handle network errors (backend not running)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    userType?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      token: string;
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      token: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async () => {
    return apiRequest<{ success: boolean; user: User }>('/auth/me');
  },

  updateProfile: async (data: { name?: string; phone?: string; address?: object }) => {
    return apiRequest<{ success: boolean; message: string; user: User }>(
      '/auth/update',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiRequest<{ success: boolean; message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// DONATIONS API
// ============================================

export const donationsApi = {
  create: async (donationData: {
    type: 'food' | 'monetary' | 'supplies';
    foodItem?: string;
    quantity?: string;
    bestBefore?: string;
    amount?: number;
    paymentMethod?: string;
    purpose?: string;
    location?: object;
    notes?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      donation: Donation;
    }>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  },

  getMyDonations: async (page = 1, limit = 10) => {
    return apiRequest<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      pages: number;
      donations: Donation[];
    }>(`/donations?page=${page}&limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiRequest<{ success: boolean; donation: Donation }>(
      `/donations/${id}`
    );
  },

  track: async (donationId: string) => {
    return apiRequest<{
      success: boolean;
      donation: {
        donationId: string;
        type: string;
        status: string;
        recipient?: object;
        timeline: object[];
        createdAt: string;
        deliveredAt?: string;
      };
    }>(`/donations/track/${donationId}`);
  },

  cancel: async (id: string) => {
    return apiRequest<{ success: boolean; message: string; donation: Donation }>(
      `/donations/${id}/cancel`,
      { method: 'PUT' }
    );
  },
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsApi = {
  createOrder: async (amount: number, options?: { tierTitle?: string; description?: string }) => {
    return apiRequest<{
      success: boolean;
      order: { id: string; amount: number; currency: string };
      orderId: string;
      paymentId: string;
      mode: string;
    }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        donationType: options?.tierTitle,
        description: options?.description,
      }),
    }).then((data) => ({
      ...data,
      orderId: data.order.id,
    }));
  },

  verify: async (data: {
    orderId: string;
    paymentId: string;
    amount?: number;
    donationType?: string;
    paymentMethod?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      receiptId: string;
      payment: {
        id: string;
        amount: number;
        donationId: string;
        receiptId: string;
      };
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((data) => ({
      ...data,
      receiptId: data.payment?.receiptId || data.receiptId,
    }));
  },

  getHistory: async (page = 1, limit = 10) => {
    return apiRequest<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      pages: number;
      payments: Payment[];
    }>(`/payments?page=${page}&limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiRequest<{ success: boolean; payment: Payment }>(
      `/payments/${id}`
    );
  },
};

// ============================================
// CONTACT API
// ============================================

export const contactApi = {
  submit: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      ticketId: string;
    }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyInquiries: async (email: string) => {
    return apiRequest<{
      success: boolean;
      count: number;
      inquiries: Contact[];
    }>(`/contact/my-inquiries?email=${encodeURIComponent(email)}`);
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  getStats: async () => {
    return apiRequest<{
      success: boolean;
      stats: {
        totalDonations: number;
        totalUsers: number;
        activeUsers: number;
        pendingDonations: number;
        completedDonations: number;
        totalFunds: number;
        estimatedMeals: number;
        monthlyDonations: number;
        donationChange: number;
      };
    }>('/admin/stats');
  },

  getDonations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);

    return apiRequest<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      pages: number;
      donations: Donation[];
    }>(`/admin/donations?${searchParams.toString()}`);
  },

  updateDonationStatus: async (
    id: string,
    data: { status: string; description?: string; recipient?: object }
  ) => {
    return apiRequest<{ success: boolean; message: string; donation: Donation }>(
      `/admin/donations/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    userType?: string;
    status?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.userType) searchParams.set('userType', params.userType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    return apiRequest<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      pages: number;
      users: User[];
    }>(`/admin/users?${searchParams.toString()}`);
  },

  getUserById: async (id: string) => {
    return apiRequest<{
      success: boolean;
      user: User;
      donations: Donation[];
      payments: Payment[];
    }>(`/admin/users/${id}`);
  },

  updateUserStatus: async (id: string, status: string) => {
    return apiRequest<{ success: boolean; message: string; user: User }>(
      `/admin/users/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
  },

  getContacts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    subject?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.subject) searchParams.set('subject', params.subject);

    return apiRequest<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      pages: number;
      contacts: Contact[];
    }>(`/admin/contacts?${searchParams.toString()}`);
  },

  updateContact: async (id: string, data: { status?: string; responseMessage?: string }) => {
    return apiRequest<{ success: boolean; message: string; contact: Contact }>(
      `/admin/contacts/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  getAnalytics: async () => {
    return apiRequest<{
      success: boolean;
      analytics: {
        byType: { _id: string; count: number }[];
        byStatus: { _id: string; count: number }[];
        monthly: { _id: { year: number; month: number }; count: number }[];
        topDonors: User[];
      };
    }>('/admin/analytics/donations');
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest<{ success: boolean; message: string; timestamp: string }>(
    '/health'
  );
};
