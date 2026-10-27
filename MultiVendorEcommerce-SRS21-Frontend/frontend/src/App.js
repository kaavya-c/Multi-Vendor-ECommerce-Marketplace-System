import React, { useEffect, useState } from 'react';
import { api, getUser, logout } from './api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import VendorRegister from './pages/VendorRegister';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import CompareProducts from './pages/CompareProducts';

function NavBar() {
  const user = getUser();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'BUYER') {
      api.wishlistCount()
          .then(count => setWishlistCount(count))
          .catch(() => setWishlistCount(0));
    }
  }, [user?.role]);

  function signOut() {
    logout();
    window.location.hash = '/login';
    window.location.reload();
  }

  return (
    <header className="nav">
      <a className="brand" href="#/">MVE Marketplace</a>
      <nav>
        <a href="#/marketplace">Shop</a>
        {user && user.role === 'BUYER' && <a href="#/cart">Cart</a>}
        {user ? (
          <a href="#/orders">Orders & Tracking</a>
        ) : (
          <a href="#/orders">Track Order</a>
        )}
        {user && user.role === 'BUYER' && (
            <a href="#/wishlist">
              Wishlist ♡ {wishlistCount > 0 && `(${wishlistCount})`}
            </a>
        )}

        {user && user.role === 'BUYER' && (
            <a href="#/compare">Compare</a>
        )}

        {user && user.role === 'BUYER' && (
            <a href="#/vendor/register">Become a Seller</a>
        )}
        {user && user.role === 'VENDOR' && <a href="#/vendor">Vendor Dashboard</a>}
        {user && user.role === 'ADMIN' && <a href="#/admin">Admin Console</a>}
        {!user ? (
          <a className="button small" href="#/login">Login</a>
        ) : (
          <button className="button small" onClick={signOut}>Logout</button>
        )}
      </nav>
    </header>
  );
}

function Page({ route }) {
  if (route === '/') return <Home />;
  if (route === '/login') return <Login />;
  if (route === '/register') return <Register />;
  if (route === '/marketplace') return <Marketplace />;
  if (route === '/cart') return <Cart />;
  if (route === '/checkout') return <Checkout />;
  if (route === '/orders') return <Orders />;
  if (route === '/wishlist') return <Wishlist />;
  if (route.startsWith('/compare')) return <CompareProducts />;
  if (route === '/vendor/register') return <VendorRegister />;
  if (route === '/vendor') return <VendorDashboard />;
  if (route === '/admin') return <AdminDashboard />;
  if (route.startsWith('/products/')) return <ProductDetails id={route.split('/')[2]} />;
  return <Home />;
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <>
      <NavBar />
      <main className="container">
        <Page route={route} />
      </main>
      <footer className="footer">SRS-21 Multi-Vendor E-Commerce Marketplace</footer>
    </>
  );
}
