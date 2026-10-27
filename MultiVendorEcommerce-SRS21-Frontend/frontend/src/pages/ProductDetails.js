import React, { useEffect, useState } from 'react';
import { api, getUser } from '../api';

export default function ProductDetails({ id }) {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.product(id),
      api.variants(id),
      api.reviews(id)
    ])
        .then(async ([p, v, r]) => {
          setProduct(p);
          setVariants(v);
          setReviews(r);

          if (v[0]) {
            setSelected(v[0].id);
          }

          const user = getUser();

          // Only buyers can use wishlist
          if (user && user.role === 'BUYER') {
            try {
              const status = await api.wishlistStatus(id);
              setWishlisted(status);
            } catch (err) {
              setWishlisted(false);
            }
          }
        })
        .catch(err => setMessage(err.message));
  }, [id]);

  async function addToCart() {
    const user = getUser();
    if (!user) {
      window.location.hash = '/login';
      return;
    }

    if (user.role !== 'BUYER') {
      setMessage('Only buyers can add products to cart and checkout.');
      return;
    }

    if (!selected) {
      setMessage('No variant is available for this product.');
      return;
    }

    try {
      await api.addCartItem({
        variantId: selected,
        quantity: 1
      });

      setMessage('Added to cart.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function toggleWishlist() {
    const user = getUser();

    if (!user) {
      window.location.hash = '/login';
      return;
    }

    if (user.role !== 'BUYER') {
      setMessage('Only buyers can use the wishlist.');
      return;
    }

    try {
      setWishlistLoading(true);
      setMessage('');

      if (wishlisted) {
        await api.removeWishlist(id);
        setWishlisted(false);
        setMessage('Product removed from wishlist.');
      } else {
        await api.addWishlist(id);
        setWishlisted(true);
        setMessage('Product added to wishlist.');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setWishlistLoading(false);
    }
  }

  if (!product) {
    return <p>{message || 'Loading...'}</p>;
  }

  return (
      <div>
        {message && (
            <div className="success">
              {message}
            </div>
        )}

        <div className="card">
          <div className="row">

            <div style={{ flex: 1 }}>
              {product.imageUrl && (
                  <img
                      className="product-details-image"
                      src={product.imageUrl}
                      alt={product.title}
                  />
              )}

              <h1>{product.title}</h1>

              <p>{product.description}</p>

              <h2>
                ₹{Number(product.sellingPrice).toLocaleString('en-IN')}
              </h2>

              <p className="muted">
                Category: {product.category?.name}
              </p>
            </div>

            <div style={{ minWidth: 260 }}>

              <h3>Choose variant</h3>

              {variants.map(v => (
                  <label
                      key={v.id}
                      style={{
                        display: 'block',
                        margin: '10px 0'
                      }}
                  >
                    <input
                        type="radio"
                        checked={selected === v.id}
                        onChange={() => setSelected(v.id)}
                    />{' '}

                    {v.sku} — {v.colour || ''} {v.size || ''} — ₹
                    {Number(v.price).toLocaleString('en-IN')} — stock{' '}
                    {v.stockQuantity}
                  </label>
              ))}

              <div className="actions">

                {(!getUser() || getUser().role === 'BUYER') ? (
                  <button
                      className="button"
                      onClick={addToCart}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <span className="badge badge-pending" style={{ padding: '8px 12px', fontSize: '12px' }}>
                    Purchasing reserved for Buyers
                  </span>
                )}

                <button
                    className="button secondary"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                >
                  {wishlistLoading
                      ? 'Please wait...'
                      : wishlisted
                          ? '♥ Remove from Wishlist'
                          : '♡ Add to Wishlist'}
                </button>

              </div>

              <br />

              <a href="#/marketplace">
                Back to Marketplace
              </a>

            </div>
          </div>
        </div>

        <h2>Reviews</h2>

        {reviews.length ? (
            reviews.map(review => (
                <div className="card" key={review.id}>
                  <strong>
                    {'★'.repeat(review.rating)}
                  </strong>

                  <p>{review.comment}</p>
                </div>
            ))
        ) : (
            <p className="muted">
              No reviews yet.
            </p>
        )}
      </div>
  );
}