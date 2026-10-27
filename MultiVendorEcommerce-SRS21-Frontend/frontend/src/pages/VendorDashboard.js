import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [awbInputs, setAwbInputs] = useState({});
  const [returns, setReturns] = useState([]);

  // Product & Variant form states
  const [product, setProduct] = useState({
    title: '',
    description: '',
    brand: '',
    hsnCode: '',
    mrp: '',
    sellingPrice: '',
    categoryId: '',
    imageUrl: ''
  });

  const [variant, setVariant] = useState({
    productId: '',
    sku: '',
    model: '',
    colour: '',
    price: '',
    stockQuantity: ''
  });

  const [showVariantForm, setShowVariantForm] = useState(false);

  // ShipRocket & Shipping states
  const [shippingModal, setShippingModal] = useState(null);
  const [rates, setRates] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);

  const [pickupModal, setPickupModal] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('10:00 AM - 01:00 PM');

  const [trackingModal, setTrackingModal] = useState(null);

  // Return handling states
  const [returnActionModal, setReturnActionModal] = useState(null);
  const [returnComment, setReturnComment] = useState('');

  async function load() {
    try {
      const [v, p, c, o, r] = await Promise.all([
        api.myVendor(),
        api.myProducts(),
        api.categories(),
        api.vendorOrders(),
        api.vendorReturns()
      ]);

      setVendor(v);
      setProducts(p);
      setCategories(c);
      setOrders(o);
      setReturns(r || []);
    } catch (err) {
      setMessage(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(event) {
    event.preventDefault();

    try {
      const created = await api.createProduct({
        ...product,
        mrp: Number(product.mrp),
        sellingPrice: Number(product.sellingPrice)
      });

      setProducts([...products, created]);

      setMessage(
        'Product created with PENDING status. Add a variant, then publish it.'
      );

      setProduct({
        title: '',
        description: '',
        brand: '',
        hsnCode: '',
        mrp: '',
        sellingPrice: '',
        categoryId: '',
        imageUrl: ''
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function addVariant(event) {
    event.preventDefault();

    try {
      await api.addVariant(variant.productId, {
        sku: variant.sku,
        model: variant.model,
        colour: variant.colour,
        price: Number(variant.price),
        stockQuantity: Number(variant.stockQuantity)
      });

      setMessage(
        'Variant added successfully. You can now publish the product.'
      );

      setShowVariantForm(false);

      setVariant({
        productId: '',
        sku: '',
        model: '',
        colour: '',
        price: '',
        stockQuantity: ''
      });

      await load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function publish(id) {
    try {
      await api.publishProduct(id);
      await load();
      setMessage('Product published successfully.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function updateOrderStatus(subOrderId, status) {
    try {
      await api.updateSubOrderStatus(subOrderId, status);
      await load();
      setMessage(`Order status updated to ${status}.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function updateAwb(subOrderId) {
    const awbNumber = awbInputs[subOrderId];

    if (!awbNumber || awbNumber.trim() === '') {
      setMessage('Please enter an AWB number.');
      return;
    }

    try {
      await api.updateAwb(subOrderId, awbNumber);
      await load();

      setMessage('AWB number saved successfully.');

      setAwbInputs({
        ...awbInputs,
        [subOrderId]: ''
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  // ShipRocket functions
  async function openShippingModal(subOrder) {
    setShippingModal({ subOrder });
    setShippingLoading(true);
    try {
      const rateData = await api.shippingRates();
      setRates(rateData || []);
      if (rateData && rateData.length > 0) {
        setSelectedCourier(rateData[0].courierName);
      }
    } catch (err) {
      setMessage('Failed to load courier rates: ' + err.message);
    } finally {
      setShippingLoading(false);
    }
  }

  async function confirmShipRocketDispatch(subOrderId) {
    try {
      const updated = await api.shipOrder(subOrderId, { courierName: selectedCourier });
      await load();
      setShippingModal(null);
      setMessage(`Shipment generated via ShipRocket! Assigned ${updated.courierName || selectedCourier} with AWB: ${updated.awbNumber}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function submitSchedulePickup(subOrderId) {
    try {
      const res = await api.schedulePickup(subOrderId, { pickupDate, timeSlot: pickupSlot });
      await load();
      setPickupModal(null);
      setMessage(`Pickup scheduled! Token: ${res.pickupToken} on ${res.pickupDate} (${res.pickupSlot})`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function openTrackingModal(subOrderId) {
    try {
      const trk = await api.trackSubOrder(subOrderId);
      setTrackingModal(trk);
    } catch (err) {
      setMessage('Tracking lookup failed: ' + err.message);
    }
  }

  // Return handling functions
  async function updateReturnStatus(returnId, status, comment = '') {
    try {
      await api.updateReturnStatus(returnId, status, comment);
      await load();
      setMessage(`Return request updated to ${status}.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function openReturnModal(returnItem, action) {
    setReturnActionModal({ returnItem, action });
    setReturnComment('');
  }

  async function submitReturnAction() {
    if (!returnActionModal) return;
    const { returnItem, action } = returnActionModal;
    if (action === 'REJECT' && !returnComment.trim()) {
      alert('Please provide a reason for rejecting this return request.');
      return;
    }
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await updateReturnStatus(returnItem.id, newStatus, returnComment);
    setReturnActionModal(null);
  }

  function openVariantForm(product) {
    setVariant({
      productId: product.id,
      sku: '',
      model: '',
      colour: '',
      price: product.sellingPrice,
      stockQuantity: ''
    });

    setShowVariantForm(true);
    setMessage('');
  }

  return (
    <div>
      <h1>Vendor Dashboard</h1>

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      {vendor && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>{vendor.storeName || vendor.businessName}</h3>
          <p>
            Status: <strong>{vendor.status}</strong>
          </p>
          <p>
            GST verified: {String(vendor.gstVerified)}
            {' • '}
            Bank verified: {String(vendor.bankVerified)}
          </p>
        </div>
      )}

      {vendor?.status === 'APPROVED' && (
        <>
          <h2>Create Product</h2>
          <form className="form" onSubmit={create}>
            <label>Title</label>
            <input
              value={product.title}
              onChange={e =>
                setProduct({
                  ...product,
                  title: e.target.value
                })
              }
              required
            />

            <label>Description</label>
            <textarea
              value={product.description}
              onChange={e =>
                setProduct({
                  ...product,
                  description: e.target.value
                })
              }
            />

            <label>Brand</label>
            <input
              value={product.brand}
              onChange={e =>
                setProduct({
                  ...product,
                  brand: e.target.value
                })
              }
            />

            <label>HSN code</label>
            <input
              value={product.hsnCode}
              onChange={e =>
                setProduct({
                  ...product,
                  hsnCode: e.target.value
                })
              }
            />

            <label>MRP</label>
            <input
              type="number"
              value={product.mrp}
              onChange={e =>
                setProduct({
                  ...product,
                  mrp: e.target.value
                })
              }
              required
            />

            <label>Selling price</label>
            <input
              type="number"
              value={product.sellingPrice}
              onChange={e =>
                setProduct({
                  ...product,
                  sellingPrice: e.target.value
                })
              }
              required
            />

            <label>Category</label>
            <select
              value={product.categoryId}
              onChange={e =>
                setProduct({
                  ...product,
                  categoryId: e.target.value
                })
              }
              required
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label>Image URL</label>
            <input
              value={product.imageUrl}
              onChange={e =>
                setProduct({
                  ...product,
                  imageUrl: e.target.value
                })
              }
            />

            <button className="button" style={{ marginTop: '16px' }}>
              Create Product
            </button>
          </form>
        </>
      )}

      <h2>My Products</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.status}</td>
                <td>₹{p.sellingPrice}</td>
                <td>
                  <button
                    className="button small"
                    disabled={p.status === 'ACTIVE'}
                    onClick={() => openVariantForm(p)}
                  >
                    Add Variant
                  </button>
                  {' '}
                  <button
                    className="button small"
                    disabled={p.status === 'ACTIVE'}
                    onClick={() => publish(p.id)}
                  >
                    Publish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>My Orders</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Shipping & Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5">No orders yet.</td>
              </tr>
            ) : (
              orders.map(order => {
                const subOrder = order.subOrders?.find(
                  s => s.vendor?.id === vendor?.id
                );

                const vendorItems =
                  order.items?.filter(
                    item => item.vendorId === vendor?.id
                  ) || [];

                return (
                  <tr key={order.id}>
                    <td>
                      <code>{order.id.substring(0, 8)}...</code>
                      <br />
                      <small className="muted">{order.shippingAddress || 'Standard Address'}</small>
                    </td>

                    <td>
                      {vendorItems.map(item => (
                        <div key={item.id}>
                          {item.variant?.sku} × {item.quantity}
                        </div>
                      ))}
                    </td>

                    <td>
                      ₹
                      {vendorItems.reduce(
                        (total, item) =>
                          total + item.unitPrice * item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <strong>{subOrder?.status || order.status}</strong>
                      {subOrder?.courierName && (
                        <div style={{ fontSize: '12px', color: '#4b5563' }}>
                          via <strong>{subOrder.courierName}</strong>
                        </div>
                      )}
                      {subOrder?.awbNumber && (
                        <div style={{ fontSize: '12px', color: '#2563eb' }}>
                          AWB: <strong>{subOrder.awbNumber}</strong>
                        </div>
                      )}
                    </td>

                    <td>
                      {subOrder?.status === 'PLACED' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="button small"
                            onClick={() => updateOrderStatus(subOrder.id, 'CONFIRMED')}
                          >
                            Confirm
                          </button>
                          <button
                            className="button danger small"
                            onClick={() => updateOrderStatus(subOrder.id, 'CANCELLED')}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {subOrder?.status === 'CONFIRMED' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            className="button small"
                            onClick={() => updateOrderStatus(subOrder.id, 'PACKED')}
                          >
                            Mark Packed
                          </button>
                          <button
                            className="button small secondary"
                            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                            onClick={() => openShippingModal(subOrder)}
                          >
                            📦 Ship with ShipRocket
                          </button>
                        </div>
                      )}

                      {subOrder?.status === 'PACKED' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              className="button small secondary"
                              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                              onClick={() => openShippingModal(subOrder)}
                            >
                              📦 Ship with ShipRocket
                            </button>
                            <button
                              className="button small"
                              disabled={!subOrder.awbNumber}
                              onClick={() => updateOrderStatus(subOrder.id, 'DISPATCHED')}
                            >
                              Mark Dispatched
                            </button>
                          </div>
                          {!subOrder.awbNumber && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                              <input
                                type="text"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                placeholder="Or manual AWB"
                                value={awbInputs[subOrder.id] || ''}
                                onChange={e =>
                                  setAwbInputs({
                                    ...awbInputs,
                                    [subOrder.id]: e.target.value
                                  })
                                }
                              />
                              <button
                                className="button small secondary"
                                onClick={() => updateAwb(subOrder.id)}
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {subOrder?.status === 'DISPATCHED' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <a
                            className="button small secondary"
                            href={`/api/v1/shipping/sub-orders/${subOrder.id}/label`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            🏷️ Label
                          </a>
                          <button
                            className="button small secondary"
                            onClick={() => openTrackingModal(subOrder.id)}
                          >
                            📍 Track
                          </button>
                          <button
                            className="button small secondary"
                            onClick={() => {
                              setPickupModal({ subOrder });
                              setPickupDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                            }}
                          >
                            📅 Pickup
                          </button>
                          <button
                            className="button small"
                            onClick={() => updateOrderStatus(subOrder.id, 'DELIVERED')}
                          >
                            Delivered
                          </button>
                        </div>
                      )}

                      {subOrder?.status === 'DELIVERED' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <a
                            className="button small secondary"
                            href={`/api/v1/shipping/sub-orders/${subOrder.id}/label`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            🏷️ Label
                          </a>
                          <button
                            className="button small secondary"
                            onClick={() => openTrackingModal(subOrder.id)}
                          >
                            📍 Track
                          </button>
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                            ✓ Delivered
                          </span>
                        </div>
                      )}

                      {subOrder?.status === 'RETURNED' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            className="button small secondary"
                            onClick={() => openTrackingModal(subOrder.id)}
                          >
                            📍 Track Return
                          </button>
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                            ✓ Return Completed
                          </span>
                        </div>
                      )}

                      {subOrder?.status === 'CANCELLED' && (
                        <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                          ✗ Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FR10: Vendor Return Handling Section */}
      <h2 style={{ marginTop: '36px' }}>Return Requests</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Return ID</th>
              <th>Sub-Order & Items</th>
              <th>Buyer</th>
              <th>Reason</th>
              <th>Refund Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td colSpan="7">No return requests found.</td>
              </tr>
            ) : (
              returns.map(r => (
                <tr key={r.id}>
                  <td>
                    <code>{r.id.substring(0, 8)}...</code>
                    <br />
                    <small className="muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <div><strong>Sub-Order:</strong> <code>{r.subOrderId ? r.subOrderId.substring(0, 8) + '...' : 'N/A'}</code></div>
                    {r.itemSummaries && r.itemSummaries.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: '#555' }}>• {it}</div>
                    ))}
                  </td>
                  <td>
                    <div><strong>{r.buyerName || 'Buyer'}</strong></div>
                    <small className="muted">{r.buyerEmail || '-'}</small>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{r.reason}</span>
                    {r.vendorComment && (
                      <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                        Note: {r.vendorComment}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>₹{Number(r.refundAmount || 0).toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                    {r.reverseAwb && (
                      <div style={{ fontSize: '11px', marginTop: '4px', color: '#2563eb' }}>
                        Reverse AWB: <strong>{r.reverseAwb}</strong>
                      </div>
                    )}
                  </td>
                  <td>
                    {r.status === 'REQUESTED' && (
                      <div className="actions">
                        <button
                          className="button small"
                          onClick={() => openReturnModal(r, 'APPROVE')}
                        >
                          Approve
                        </button>
                        <button
                          className="button danger small"
                          onClick={() => openReturnModal(r, 'REJECT')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        className="button small"
                        style={{ background: '#059669' }}
                        onClick={() => updateReturnStatus(r.id, 'REFUNDED')}
                      >
                        Mark Refunded
                      </button>
                    )}
                    {r.status === 'REFUNDED' && (
                      <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>✓ Completed</span>
                    )}
                    {r.status === 'REJECTED' && (
                      <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>✗ Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ShipRocket Shipping Modal */}
      {shippingModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '600px', width: '92%' }}>
            <h3>Ship with ShipRocket Courier API</h3>
            <p className="muted">
              Select your preferred courier partner for Sub-Order #{shippingModal.subOrder.id.substring(0, 8)}:
            </p>

            {shippingLoading ? (
              <p>Calculating live courier rates via ShipRocket...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
                {rates.map(rate => (
                  <div
                    key={rate.courierCode}
                    onClick={() => setSelectedCourier(rate.courierName)}
                    style={{
                      border: selectedCourier === rate.courierName ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      background: selectedCourier === rate.courierName ? '#eff6ff' : 'white',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <strong>{rate.courierName}</strong>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        ⭐ {rate.rating} • Estimated Delivery: {rate.etdDays} days
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700 }}>₹{rate.freightCharge}</span>
                      <div style={{ fontSize: '11px', color: '#10b981' }}>Express Delivery</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="actions" style={{ marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setShippingModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                disabled={!selectedCourier || shippingLoading}
                onClick={() => confirmShipRocketDispatch(shippingModal.subOrder.id)}
              >
                Book Shipment & Generate AWB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Scheduling Modal */}
      {pickupModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '480px', width: '92%' }}>
            <h3>Schedule Courier Pickup</h3>
            <p className="muted">
              Sub-Order #{pickupModal.subOrder.id.substring(0, 8)} • Courier: {pickupModal.subOrder.courierName || 'ShipRocket Partner'}
            </p>

            <label style={{ display: 'block', margin: '12px 0 6px', fontWeight: 600 }}>Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={e => setPickupDate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
            />

            <label style={{ display: 'block', margin: '12px 0 6px', fontWeight: 600 }}>Time Slot</label>
            <select
              value={pickupSlot}
              onChange={e => setPickupSlot(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
            >
              <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
              <option value="02:00 PM - 06:00 PM">Afternoon (02:00 PM - 06:00 PM)</option>
            </select>

            <div className="actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setPickupModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={() => submitSchedulePickup(pickupModal.subOrder.id)}
              >
                Confirm Pickup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Action Modal (Approve / Reject) */}
      {returnActionModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '500px', width: '92%' }}>
            <h3>
              {returnActionModal.action === 'APPROVE' ? 'Approve Return Request' : 'Reject Return Request'}
            </h3>
            <p className="muted">
              Buyer: <strong>{returnActionModal.returnItem.buyerName || 'Buyer'}</strong> • Refund: ₹{returnActionModal.returnItem.refundAmount}
            </p>

            <label style={{ display: 'block', margin: '12px 0 6px', fontWeight: 600 }}>
              {returnActionModal.action === 'APPROVE' ? 'Approval Note (Optional)' : 'Rejection Reason (Required)'}
            </label>
            <textarea
              value={returnComment}
              onChange={e => setReturnComment(e.target.value)}
              placeholder={returnActionModal.action === 'APPROVE' ? 'e.g. Return approved, please pack original item.' : 'e.g. Item condition does not meet return policy criteria.'}
              style={{ width: '100%', minHeight: '80px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
              required={returnActionModal.action === 'REJECT'}
            />

            <div className="actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setReturnActionModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`button ${returnActionModal.action === 'REJECT' ? 'danger' : ''}`}
                onClick={submitReturnAction}
              >
                {returnActionModal.action === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '650px', width: '92%' }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3>Real-Time Shipment Tracking</h3>
                <p className="muted" style={{ margin: '4px 0' }}>
                  Courier: <strong>{trackingModal.courierName}</strong> • AWB: <strong>{trackingModal.awbNumber}</strong>
                </p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                  EDD: <strong>{trackingModal.estimatedDeliveryDate}</strong>
                </p>
              </div>
              <button
                className="button small secondary"
                onClick={() => setTrackingModal(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Visual Route Map / Stepper */}
            <div className="tracking-progress-box">
              <div className="tracking-bar">
                <div className="tracking-bar-fill" style={{ width: `${trackingModal.progressPercent}%` }} />
              </div>
              <div className="tracking-milestones">
                <span className={trackingModal.progressPercent >= 20 ? 'active' : ''}>Picked Up</span>
                <span className={trackingModal.progressPercent >= 50 ? 'active' : ''}>In Transit</span>
                <span className={trackingModal.progressPercent >= 80 ? 'active' : ''}>Out for Delivery</span>
                <span className={trackingModal.progressPercent >= 100 ? 'active' : ''}>Delivered</span>
              </div>
            </div>

            {/* Interactive Route Map Container */}
            <div className="route-map-visual">
              <div className="route-point origin">
                <span className="dot" />
                <div className="label">Origin: Bengaluru Hub</div>
              </div>
              <div className="route-line">
                <div className="route-truck" style={{ left: `${Math.min(90, Math.max(10, trackingModal.progressPercent))}%` }}>
                  🚚
                </div>
              </div>
              <div className="route-point destination">
                <span className="dot" />
                <div className="label">Destination Address</div>
              </div>
            </div>

            {/* Checkpoint history list */}
            <h4 style={{ margin: '16px 0 8px' }}>Tracking History</h4>
            <div className="checkpoints-list">
              {trackingModal.checkpoints && trackingModal.checkpoints.map((cp, idx) => (
                <div key={idx} className="checkpoint-item">
                  <div className="cp-dot" />
                  <div className="cp-content">
                    <strong>{cp.activity}</strong>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {cp.location} • {cp.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Variant Form Modal */}
      {showVariantForm && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h2>Add Product Variant</h2>

          <form className="form" onSubmit={addVariant}>
            <label>SKU</label>
            <input
              value={variant.sku}
              onChange={e =>
                setVariant({
                  ...variant,
                  sku: e.target.value
                })
              }
              placeholder="Example: VIVO-Y32-BLK-128"
              required
            />

            <label>Model</label>
            <input
              value={variant.model}
              onChange={e =>
                setVariant({
                  ...variant,
                  model: e.target.value
                })
              }
              placeholder="Example: 128GB"
            />

            <label>Colour</label>
            <input
              value={variant.colour}
              onChange={e =>
                setVariant({
                  ...variant,
                  colour: e.target.value
                })
              }
              placeholder="Example: Black"
            />

            <label>Price</label>
            <input
              type="number"
              value={variant.price}
              onChange={e =>
                setVariant({
                  ...variant,
                  price: e.target.value
                })
              }
              required
            />

            <label>Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={variant.stockQuantity}
              onChange={e =>
                setVariant({
                  ...variant,
                  stockQuantity: e.target.value
                })
              }
              required
            />

            <button className="button" style={{ marginTop: '16px' }}>
              Add Variant
            </button>
            {' '}
            <button
              type="button"
              className="button secondary"
              onClick={() => setShowVariantForm(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}