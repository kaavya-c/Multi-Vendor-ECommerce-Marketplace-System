import React, { useState } from 'react';
import { api, saveAuth } from '../api';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await api.register(form);
      saveAuth(data);
      window.location.hash = '/marketplace';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Create Buyer Account</h1>
      <form className="form" onSubmit={submit}>
        {error && <div className="notice">{error}</div>}
        <label>Full name</label>
        <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" minLength="6" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <br /><br />
        <button className="button">Register</button>
        <p className="muted">Already registered? <a href="#/login">Login</a></p>
      </form>
    </div>
  );
}
