import React, { useState } from 'react';
import { api } from '../api';

export default function Checkout() {
  const [form, setForm] = useState({ shippingAddress: '', paymentMethod: 'UPI' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const order = await api.checkout(form);
      await api.capturePayment(order.id);
      window.location.hash = '/orders';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Checkout</h1>
      <form className="form" onSubmit={submit}>
        {error && <div className="notice">{error}</div>}
        <label>Delivery address</label>
        <textarea value={form.shippingAddress} onChange={e => setForm({ ...form, shippingAddress: e.target.value })} required />
        <label>Payment method</label>
        <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
          <option>UPI</option>
          <option>DEBIT_CARD</option>
          <option>CREDIT_CARD</option>
          <option>NET_BANKING</option>
          <option>COD</option>
        </select>
        <br /><br />
        <button className="button">Place Order & Pay</button>
      </form>
    </div>
  );
}
