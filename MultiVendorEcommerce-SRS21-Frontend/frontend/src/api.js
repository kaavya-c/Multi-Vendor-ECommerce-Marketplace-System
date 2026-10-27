const API_BASE = '/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('mve_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`,
      {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.error || data.message || JSON.stringify(data.errors) || message;
    } catch {
      // Keep the default message when the server has no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  register: (body) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  login: (body) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  me: () => request('/users/me'),
  products: (search = '') => request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  product: (id) => request(`/products/${id}`),
  variants: (id) => request(`/products/${id}/variants`),
  categories: () => request('/categories'),
  registerVendor: (body) => request('/vendors/register', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  myVendor: () => request('/vendors/me'),
  adminVendors: () => request('/admin/vendors'),
  adminOrders: () => request('/admin/orders'),
  adminReturns: () => request('/admin/returns'),
  approveVendor: (id) => request(`/admin/vendors/${id}/approve`, { method: 'PUT' }),
  rejectVendor: (id) => request(`/admin/vendors/${id}/reject`, { method: 'PUT' }),
  createProduct: (body) => request('/products', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  myProducts: () => request('/products/vendor/mine'),
  addVariant: (productId, body) => request(`/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  publishProduct: (id) => request(`/products/${id}/publish`, { method: 'POST' }),
  cart: () => request('/cart'),
  addCartItem: (body) => request('/cart/items', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  removeCartItem: (id) => request(`/cart/items/${id}`, { method: 'DELETE' }),
  checkout: (body) => request('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  orders: () => request('/orders'),

  vendorOrders: () => request('/orders/vendor/mine'),

  updateSubOrderStatus: (subOrderId, status) =>
      request(`/orders/sub-orders/${subOrderId}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT'
      }),

  updateAwb: (subOrderId, awbNumber) =>
      request(
          `/orders/sub-orders/${subOrderId}/awb?awbNumber=${encodeURIComponent(awbNumber)}`,
          {
            method: 'PUT'
          }
      ),

  cancelSubOrder: (subOrderId) =>
      request(`/orders/sub-orders/${subOrderId}/cancel`, {
        method: 'PUT'
      }),

  capturePayment: (orderId) => request(`/payments/capture/${orderId}`, { method: 'POST' }),
  reviews: (productId) => request(`/reviews/product/${productId}`),
  addReview: (body) => request('/reviews', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  returns: () => request('/returns'),
  vendorReturns: () => request('/returns/vendor'),
  createReturn: (body) => request('/returns', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  updateReturnStatus: (id, status, comment) =>
    request(`/returns/${id}/status?status=${encodeURIComponent(status)}${comment ? `&comment=${encodeURIComponent(comment)}` : ''}`, {
      method: 'PUT'
    }),
  shippingRates: (pickupPincode = '560001', deliveryPincode = '110001', weight = 0.5) =>
    request(`/shipping/rates?pickupPincode=${encodeURIComponent(pickupPincode)}&deliveryPincode=${encodeURIComponent(deliveryPincode)}&weight=${encodeURIComponent(weight)}`),
  shipOrder: (subOrderId, courierData) =>
    request(`/shipping/sub-orders/${subOrderId}/ship`, {
      method: 'POST',
      body: JSON.stringify(courierData || {})
    }),
  schedulePickup: (subOrderId, pickupData) =>
    request(`/shipping/sub-orders/${subOrderId}/schedule-pickup`, {
      method: 'POST',
      body: JSON.stringify(pickupData || {})
    }),
  trackSubOrder: (subOrderId) =>
    request(`/shipping/sub-orders/${subOrderId}/track`),
  trackAwb: (awbNumber) =>
    request(`/shipping/track/${encodeURIComponent(awbNumber)}`),
  adminDisputes: () => request('/admin/disputes'),
  resolveDispute: (id, resolution) =>
    request(`/admin/disputes/${id}/resolve?resolution=${encodeURIComponent(resolution)}`, {
      method: 'PUT'
    }),
  raiseDispute: (orderId, type, description) =>
    request(`/disputes?orderId=${encodeURIComponent(orderId)}&type=${encodeURIComponent(type)}&description=${encodeURIComponent(description)}`, {
      method: 'POST'
    }),
  wishlist: () => request('/wishlist'),

  addWishlist: (productId) =>
      request(`/wishlist/${productId}`, {
        method: 'POST'
      }),

  removeWishlist: (productId) =>
      request(`/wishlist/${productId}`, {
        method: 'DELETE'
      }),

  wishlistStatus: (productId) =>
      request(`/wishlist/${productId}/status`),

  wishlistCount: () =>
      request('/wishlist/count'),
};

export function saveAuth(data) {
  localStorage.setItem('mve_token', data.token);
  localStorage.setItem('mve_user', JSON.stringify(data.user));
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('mve_user'));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('mve_token');
  localStorage.removeItem('mve_user');
}
