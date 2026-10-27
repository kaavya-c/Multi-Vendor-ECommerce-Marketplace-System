import React from 'react';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', desc: 'Laptops, phones & audio gear' },
  { name: 'Fashion', icon: '👗', desc: 'Clothing, footwear & style' },
  { name: 'Home & Kitchen', icon: '🏡', desc: 'Cookware, decor & living' },
  { name: 'Beauty', icon: '✨', desc: 'Skincare, cosmetics & care' },
  { name: 'Sports', icon: '🏃', desc: 'Fitness, gear & activewear' },
  { name: 'Accessories', icon: '⌚', desc: 'Watches, bags & jewellery' },
  { name: 'Books', icon: '📚', desc: 'Fiction, non-fiction & learning' },
  { name: 'Grocery', icon: '🥑', desc: 'Fresh staples & everyday food' },
];

export default function Home() {
  return (
    <div>
      {/* Friendly Announcement Bar */}
      <div className="home-announcement">
        <span>✨ Welcome to MVE Marketplace — Direct from verified independent merchants & trusted sellers</span>
      </div>

      {/* Main Hero Banner */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">Verified Multi-Vendor Platform</span>
          <h1>Shop quality goods directly from trusted independent sellers.</h1>
          <p className="home-hero-sub">
            Explore authentic electronics, apparel, home essentials, books, and groceries. Enjoy secure payments, real-time courier tracking powered by ShipRocket, and verified seller returns.
          </p>

          <div className="actions" style={{ marginTop: 24 }}>
            <a className="button home-cta-btn" href="#/marketplace">
              Explore All Products →
            </a>
            <a className="button secondary home-cta-secondary" href="#/vendor/register">
              Become a Seller
            </a>
          </div>
        </div>
      </section>

      {/* Visual Category Showcase */}
      <section style={{ marginTop: 40, marginBottom: 44 }}>
        <div className="row" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.45rem' }}>Browse by Category</h2>
            <p className="muted" style={{ margin: 0 }}>
              Quickly find what you need across our 8 core marketplace departments.
            </p>
          </div>
          <a className="button secondary small" href="#/marketplace">
            View All Categories →
          </a>
        </div>

        <div className="home-category-grid">
          {CATEGORIES.map(cat => (
            <a
              key={cat.name}
              href={`#/marketplace`}
              className="home-category-card"
            >
              <span className="home-category-icon">{cat.icon}</span>
              <strong className="home-category-title">{cat.name}</strong>
              <span className="home-category-desc">{cat.desc}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Trust & Marketplace Pillars */}
      <section style={{ marginTop: 40, marginBottom: 44 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.45rem' }}>Why Shop on MVE Marketplace</h2>
        <p className="muted" style={{ margin: '0 0 24px' }}>
          Built with care for authentic shopping, verified sellers, and reliable delivery.
        </p>

        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon-wrap">🛡️</div>
            <h3>Verified Sellers</h3>
            <p className="muted">
              Every seller account is manually reviewed with valid GSTIN and business credentials before publishing products.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon-wrap">📦</div>
            <h3>ShipRocket Live Tracking</h3>
            <p className="muted">
              Every dispatched order receives a real courier AWB with route milestones, hub locations, and estimated delivery dates.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon-wrap">🔒</div>
            <h3>Secure Escrow Payments</h3>
            <p className="muted">
              Supports UPI, Debit/Credit cards, and Net Banking. Funds are safely held until shipment receipt is confirmed.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon-wrap">↩️</div>
            <h3>Hassle-Free Returns</h3>
            <p className="muted">
              Easy 7-day return requests handled directly by vendors, featuring automated reverse logistics and escrow refunds.
            </p>
          </div>
        </div>
      </section>

      {/* Seller Invitation Banner */}
      <section className="home-seller-banner">
        <div className="home-seller-content">
          <span className="home-seller-tag">Join Our Seller Network</span>
          <h2>Grow your brand on MVE Marketplace</h2>
          <p className="muted" style={{ maxWidth: 560, margin: '8px 0 20px', color: '#475569' }}>
            Set up your digital storefront, upload product variants, schedule ShipRocket pickups, and manage returns effortlessly with zero listing fees.
          </p>
          <a className="button" href="#/vendor/register" style={{ padding: '11px 22px' }}>
            Register as a Seller Today
          </a>
        </div>
      </section>
    </div>
  );
}
