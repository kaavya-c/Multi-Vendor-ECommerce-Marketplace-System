import React, { useEffect, useState } from 'react';
import { api, getUser } from '../api';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(new Set());
  const [compareProducts, setCompareProducts] = useState([]);

  async function load(term = '') {
    try {
      const [productData, catData] = await Promise.all([
        api.products(term),
        api.categories().catch(() => [])
      ]);

      setProducts(productData || []);
      if (catData && catData.length > 0) {
        setCategories(catData);
      }
      setError('');

      const user = getUser();
      if (user && user.role === 'BUYER') {
        const wishlistItems = await api.wishlist();
        setWishlist(
          new Set(
            wishlistItems
              .map(item => item.product?.id)
              .filter(Boolean)
          )
        );
      } else {
        setWishlist(new Set());
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function submit(event) {
    event.preventDefault();
    load(search);
  }

  async function toggleWishlist(productId) {
    const user = getUser();
    if (!user) {
      window.location.hash = '/login';
      return;
    }

    if (user.role !== 'BUYER') {
      setError('Only buyers can use the wishlist.');
      return;
    }

    try {
      if (wishlist.has(productId)) {
        await api.removeWishlist(productId);
        setWishlist(previous => {
          const updated = new Set(previous);
          updated.delete(productId);
          return updated;
        });
      } else {
        await api.addWishlist(productId);
        setWishlist(previous => {
          const updated = new Set(previous);
          updated.add(productId);
          return updated;
        });
      }
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleCompare(product) {
    const user = getUser();
    if (!user) {
      window.location.hash = '/login';
      return;
    }

    if (user.role !== 'BUYER') {
      setError('Only buyers can compare products.');
      return;
    }

    setCompareProducts(previous => {
      const alreadySelected = previous.some(item => item.id === product.id);
      if (alreadySelected) {
        return previous.filter(item => item.id !== product.id);
      }
      if (previous.length >= 3) {
        setError('You can compare up to 3 products.');
        return previous;
      }
      return [...previous, product];
    });

    setError('');
  }

  function openComparison() {
    if (compareProducts.length < 2) {
      setError('Select at least 2 products to compare.');
      return;
    }
    const ids = compareProducts.map(product => product.id).join(',');
    window.location.hash = `/compare?ids=${ids}`;
  }

  const displayedProducts = products.filter(product => {
    if (selectedCategory === 'ALL') return true;
    return product.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
           product.category?.id === selectedCategory;
  });

  return (
    <div>
      <div className="row" style={{ alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0' }}>Marketplace</h1>
          <p className="muted" style={{ margin: 0 }}>
            Active products from verified and approved vendors.
          </p>
        </div>

        <form onSubmit={submit} style={{ minWidth: 280 }}>
          <input
            className="search"
            placeholder="Search products, brands, or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </div>

      {categories.length > 0 && (
        <div className="category-chips-container" style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`category-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id || cat.name}
                type="button"
                className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'ALL' : cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="notice">{error}</div>}

      {compareProducts.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="row">
            <div>
              <strong>
                {compareProducts.length} product{compareProducts.length !== 1 ? 's' : ''} selected
              </strong>
              <p className="muted" style={{ margin: '4px 0 0' }}>
                Select 2 or 3 products to compare side-by-side.
              </p>
            </div>

            <div className="actions">
              <button
                className="button"
                onClick={openComparison}
                disabled={compareProducts.length < 2}
              >
                Compare Selected ({compareProducts.length})
              </button>
              <button
                className="button secondary"
                onClick={() => setCompareProducts([])}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        {displayedProducts.map(product => {
          const isWishlisted = wishlist.has(product.id);
          const isCompared = compareProducts.some(item => item.id === product.id);

          return (
            <div className="card product-card" key={product.id}>
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
                      ₹{Number(product.sellingPrice).toLocaleString('en-IN')}
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
                <a className="button small flex-1" href={`#/products/${product.id}`}>
                  View Details
                </a>
                <button
                  className={`button small ${isWishlisted ? 'button-wishlisted' : 'secondary'}`}
                  onClick={() => toggleWishlist(product.id)}
                  title="Wishlist"
                >
                  {isWishlisted ? '♥ Saved' : '♡ Wishlist'}
                </button>
                <button
                  className={`button small ${isCompared ? 'button-compared' : 'secondary'}`}
                  onClick={() => toggleCompare(product)}
                  title="Compare"
                >
                  {isCompared ? '✓ Selected' : 'Compare'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!displayedProducts.length && (
        <div className="card empty-state" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>No products found</h3>
          <p className="muted">
            {selectedCategory !== 'ALL'
              ? `No active products found in category "${selectedCategory}".`
              : 'No active products match your search query.'}
          </p>
          {selectedCategory !== 'ALL' && (
            <button
              className="button secondary small"
              onClick={() => setSelectedCategory('ALL')}
              style={{ marginTop: 12 }}
            >
              Show all products
            </button>
          )}
        </div>
      )}
    </div>
  );
}