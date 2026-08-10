import { http, HttpResponse } from 'msw';

const sampleUser = {
  id: 'u-1',
  name: 'Nadia Wilson',
  role: 'admin',
  email: 'admin@amdoxerp.com',
};

export const handlers = [
  // Auth login - FIXED: use http instead of rest
  http.post('/api/auth/login', async ({ request }) => {
    try {
      const body = await request.json();
      console.log('Login request:', body);
      
      if (body.email === 'admin@amdoxerp.com' && body.password === 'enterprise') {
        console.log('Login successful, returning token');
        return HttpResponse.json(
          { 
            token: 'mock-token-123', 
            user: sampleUser 
          },
          { status: 200 }
        );
      }
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    } catch (error) {
      console.error('Login handler error:', error);
      return HttpResponse.json(
        { message: 'Server error' },
        { status: 500 }
      );
    }
  }),

  // Dashboard stats
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      employees: 1284,
      projects: 48,
      revenue: 4850000,
      expenses: 1240000,
      inventoryItems: 18940,
      payrollProcessed: 1800000,
      pendingPO: 24,
      pendingTasks: 312,
    });
  }),

  // Inventory
  http.get('/api/inventory/status', () => {
    return HttpResponse.json({
      lowStock: 32,
      outOfStock: 5,
      overstock: 12,
      topMoving: ['Laptop', 'Monitor', 'Keyboard'],
    });
  }),

  // Approvals
  http.get('/api/approvals/pending', () => {
    return HttpResponse.json({
      leaveRequests: 12,
      purchaseOrders: 8,
      expenseClaims: 6,
      invoices: 15,
    });
  }),

  // Notifications
  http.get('/api/notifications', () => {
    return HttpResponse.json([
      'Inventory below threshold',
      'Payroll completed',
      'New leave request',
      'Invoice overdue',
    ]);
  }),

  // AI Forecast
  http.get('/api/forecast/inventory', () => {
    return HttpResponse.json({
      item: 'Laptop',
      current: 250,
      predicted: 340,
      confidence: 0.92,
    });
  }),
];