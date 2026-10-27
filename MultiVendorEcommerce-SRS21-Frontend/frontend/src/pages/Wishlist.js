import React, { useEffect, useState } from 'react';
import { api, getUser } from '../api';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadWishlist() {
    try {
      setLoading(true);
      const data = await api.wishlist();
      setWishlist(data || []);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getUser()) {
      window.location.hash = '/login';
      return;
    }
    loadWishlist();
  }, []);

  async function removeFromWishlist(productId) {
    try {
      await api.removeWishlist(productId);
      setMessage('Product removed from wishlist.');
      await loadWishlist();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!getUser()) {
    return <p>Redirecting to login...</p>;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p className="muted">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>My Wishlist</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            {wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        <a className="button secondary small" href="#/marketplace">
          ← Continue Shopping
        </a>
      </div>

      {message && <div className="success">{message}</div>}

      {!wishlist.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '54px 24px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>♡</div>
          <h2 style={{ marginBottom: 8 }}>Your wishlist is empty</h2>
          <p className="muted" style={{ marginBottom: 20 }}>
            Save items that catch your eye while shopping and they will appear here.
          </p>
          <a className="button" href="#/marketplace">
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid">
          {wishlist.map(item => {
            const product = item.product;
            if (!product) return null;

            return (
              <div className="card product-card" key={item.id}>
                <a
                  href={`#/products/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="product-image-wrap">
                    {product.imageUrl ? (
                      <img
                        className="product-image"
                        src={product.imageUrl}
                        alt={product.title}
                      />
                    ) : (
                      <div className="product-image placeholder" />
                    )}
                    {product.category && (
                      <span className="product-category-tag">{product.category.name}</span>
                    )}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <p className="product-brand">{product.brand || 'Marketplace Seller'}</p>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-price-row">
                      <strong className="product-price">
                        ₹{Number(product.sellingPrice || 0).toLocaleString('en-IN')}
                      </strong>
                      {product.mrp && product.mrp > product.sellingPrice && (
                        <span className="product-mrp">
                          ₹{Number(product.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </a>

                <div className="actions" style={{ marginTop: 14 }}>
                  <a
                    className="button small flex-1"
                    href={`#/products/${product.id}`}
                  >
                    View Product
                  </a>

                  <button
                    className="button secondary small"
                    onClick={() => removeFromWishlist(product.id)}
                    title="Remove from wishlist"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}