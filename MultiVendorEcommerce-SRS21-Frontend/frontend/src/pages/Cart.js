import React, { useEffect, useState } from 'react';
import { api, getUser } from '../api';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const user = getUser();

  async function load() {
    try {
      const data = await api.cart();
      setItems(data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!user) {
      window.location.hash = '/login';
      return;
    }
    if (user.role === 'BUYER') {
      load();
    }
  }, []);

  if (!user) {
    return <p>Redirecting to login...</p>;
  }

  if (user.role !== 'BUYER') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '54px 24px', maxWidth: 640, margin: '40px auto' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
        <h2 style={{ marginBottom: 10 }}>Shopping Cart Reserved for Buyers</h2>
        <p className="muted" style={{ marginBottom: 24, lineHeight: 1.6 }}>
          You are currently signed in as <strong>{user.role}</strong> ({user.email}). The shopping cart and checkout features are only available to Buyer accounts.
        </p>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <a className="button" href={user.role === 'ADMIN' ? '#/admin' : '#/vendor'}>
            Go to {user.role === 'ADMIN' ? 'Admin Console' : 'Vendor Dashboard'}
          </a>
          <a className="button secondary" href="#/marketplace">
            Browse Marketplace
          </a>
        </div>
      </div>
    );
  }

  async function remove(id) {
    try {
      await api.removeCartItem(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  return (
    <div>
      <div className="row" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>Shopping Cart</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        {items.length > 0 && (
          <a className="button secondary small" href="#/marketplace">
            ← Continue Shopping
          </a>
        )}
      </div>

      {error && <div className="notice">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: items.length ? '1fr 340px' : '1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map(item => {
            const product = item.variant?.product;
            return (
              <div className="card" key={item.id} style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title || item.variant?.sku}
                      className="cart-thumbnail"
                    />
                  ) : (
                    <div className="cart-thumbnail placeholder" />
                  )}

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <a
                      href={product?.id ? `#/products/${product.id}` : '#/marketplace'}
                      style={{ fontWeight: 600, fontSize: 15, color: 'inherit', display: 'block', marginBottom: 4 }}
                    >
                      {product?.title || item.variant?.sku}
                    </a>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                      SKU: {item.variant?.sku} {item.variant?.colour ? `• ${item.variant.colour}` : ''}
                    </p>
                    <div style={{ fontSize: 13.5, color: '#475569', marginTop: 6 }}>
                      ₹{Number(item.variant?.price || 0).toLocaleString('en-IN')} × {item.quantity}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <strong style={{ fontSize: 17, color: 'var(--text-main)' }}>
                      ₹{Number((item.variant?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </strong>
                    <button
                      className="button danger small"
                      onClick={() => remove(item.id)}
                      title="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!items.length && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
              <h3 style={{ marginBottom: 8 }}>Your cart is empty</h3>
              <p className="muted" style={{ marginBottom: 20 }}>
                Explore the marketplace and discover items you love.
              </p>
              <a className="button" href="#/marketplace">
                Continue shopping
              </a>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="card" style={{ position: 'sticky', top: 90 }}>
            <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: 'var(--text-muted)' }}>
              <span>Total Items:</span>
              <span>{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 14, color: 'var(--text-muted)' }}>
              <span>Delivery Charges:</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: 16 }}>Total:</strong>
              <strong style={{ fontSize: 22, color: 'var(--primary)' }}>
                ₹{total.toLocaleString('en-IN')}
              </strong>
            </div>
            <a
              className="button"
              href="#/checkout"
              style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center' }}
            >
              Proceed to Checkout →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
