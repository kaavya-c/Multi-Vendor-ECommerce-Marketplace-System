import React, { useState } from 'react';
import { api } from '../api';

export default function VendorRegister() {
  const [form, setForm] = useState({
    businessName: '', businessType: 'INDIVIDUAL', phone: '', gstin: '', pan: '',
    storeName: '', storeDescription: '', returnPolicy: ''
  });
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await api.registerVendor(form);
      setMessage('Vendor application submitted. Status: PENDING. Admin approval is required before product listing.');
      setTimeout(() => { window.location.hash = '/marketplace'; }, 1200);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h1>Become a Seller</h1>
      <p className="muted">Your application remains pending until the marketplace admin approves it.</p>
      {message && <div className="success">{message}</div>}
      <form className="form" onSubmit={submit}>
        <label>Business name</label><input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} required />
        <label>Business type</label><select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })}><option>INDIVIDUAL</option><option>PROPRIETORSHIP</option><option>COMPANY</option></select>
        <label>Mobile</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
        <label>GSTIN</label><input value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} />
        <label>PAN</label><input value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value })} />
        <label>Store name</label><input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} />
        <label>Store description</label><textarea value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })} />
        <label>Return policy</label><textarea value={form.returnPolicy} onChange={e => setForm({ ...form, returnPolicy: e.target.value })} />
        <button className="button">Submit Vendor Application</button>
      </form>
    </div>
  );
}
