import React, { useState } from 'react';
import { api, saveAuth } from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await api.login(form);
      saveAuth(data);
      if (data.user.role === 'ADMIN') window.location.hash = '/admin';
      else if (data.user.role === 'VENDOR') window.location.hash = '/vendor';
      else window.location.hash = '/marketplace';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form className="form" onSubmit={submit}>
        {error && <div className="notice">{error}</div>}
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <br /><br />
        <button className="button">Login</button>
        <p className="muted">New buyer? <a href="#/register">Create an account</a></p>
        <p className="muted">Local admin: admin@marketplace.local / admin123</p>
      </form>
    </div>
  );
}
