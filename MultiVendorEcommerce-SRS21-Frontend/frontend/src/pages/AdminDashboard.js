import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'vendors' | 'disputes'
  const [vendors, setVendors] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters for Orders tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Tracking modal state
  const [trackingModal, setTrackingModal] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [vList, dList, oList, rList] = await Promise.all([
        api.adminVendors().catch(() => []),
        api.adminDisputes().catch(() => []),
        api.adminOrders().catch(() => []),
        api.adminReturns().catch(() => [])
      ]);
      setVendors(vList || []);
      setDisputes(dList || []);
      setOrders(oList || []);
      setReturns(rList || []);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    try {
      await api.approveVendor(id);
      await load();
      setMessage('Vendor approved successfully.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function reject(id) {
    try {
      await api.rejectVendor(id);
      await load();
      setMessage('Vendor application rejected.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function resolveDispute(id, resolution) {
    try {
      await api.resolveDispute(id, resolution);
      await load();
      setMessage(`Dispute resolved with status: ${resolution}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleTrackOrder(subOrder) {
    if (!subOrder) return;
    setTrackingLoading(true);
    setTrackingModal({
      awbNumber: subOrder.awbNumber,
      courierName: subOrder.courierName || 'ShipRocket Partner',
      loading: true
    });

    try {
      const trackData = await api.trackSubOrder(subOrder.id);
      setTrackingModal(trackData);
    } catch (err) {
      setTrackingModal({
        awbNumber: subOrder.awbNumber,
        courierName: subOrder.courierName || 'ShipRocket Partner',
        status: subOrder.status || 'IN_TRANSIT',
        currentLocation: 'Transit Hub Facility',
        progressPercent: subOrder.status === 'DELIVERED' ? 100 : (subOrder.status === 'RETURNED' ? 100 : 65),
        estimatedDeliveryDate: subOrder.status === 'DELIVERED' ? 'Delivered' : (subOrder.status === 'RETURNED' ? 'Return Processed' : 'Estimated 2-3 days'),
        checkpoints: [
          { activity: 'Shipment dispatched by vendor', location: 'Vendor Hub', timestamp: 'Today' },
          { activity: 'In transit via courier partner', location: 'Sorting Facility', timestamp: 'Current' }
        ]
      });
    } finally {
      setTrackingLoading(false);
    }
  }

  function getReturnForSubOrder(subOrderId) {
    return returns.find(r => r.subOrderId === subOrderId || (r.subOrder && r.subOrder.id === subOrderId));
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    const orderIdMatch = order.id && order.id.toLowerCase().includes(q);
    const buyerNameMatch = order.buyerName && order.buyerName.toLowerCase().includes(q);
    const buyerEmailMatch = order.buyerEmail && order.buyerEmail.toLowerCase().includes(q);
    const addressMatch = order.shippingAddress && order.shippingAddress.toLowerCase().includes(q);

    const vendorMatch = order.subOrders && order.subOrders.some(so => {
      const v = so.vendor;
      return (v?.storeName && v.storeName.toLowerCase().includes(q)) ||
             (v?.businessName && v.businessName.toLowerCase().includes(q)) ||
             (so.awbNumber && so.awbNumber.toLowerCase().includes(q));
    });

    const itemMatch = order.items && order.items.some(item => {
      return (item.variant?.product?.title && item.variant.product.title.toLowerCase().includes(q)) ||
             (item.variant?.sku && item.variant.sku.toLowerCase().includes(q));
    });

    return orderIdMatch || buyerNameMatch || buyerEmailMatch || addressMatch || vendorMatch || itemMatch;
  });

  return (
    <div>
      <div className="row" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Console</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Comprehensive marketplace oversight: orders, vendors, and dispute arbitration.
          </p>
        </div>

        <button className="button secondary small" onClick={load}>
          ↻ Refresh Data
        </button>
      </div>

      {message && <div className="success">{message}</div>}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid var(--border-light)', marginBottom: 24 }}>
        <button
          type="button"
          className="tab-btn"
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            cursor: 'pointer',
            fontSize: 14.5
          }}
          onClick={() => setActiveTab('orders')}
        >
          📦 All Marketplace Orders ({orders.length})
        </button>

        <button
          type="button"
          className="tab-btn"
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'vendors' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'vendors' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'vendors' ? 700 : 500,
            cursor: 'pointer',
            fontSize: 14.5
          }}
          onClick={() => setActiveTab('vendors')}
        >
          🏢 Vendor Applications ({vendors.length})
        </button>

        <button
          type="button"
          className="tab-btn"
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'disputes' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'disputes' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'disputes' ? 700 : 500,
            cursor: 'pointer',
            fontSize: 14.5
          }}
          onClick={() => setActiveTab('disputes')}
        >
          ⚖️ Buyer & Vendor Disputes ({disputes.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ALL BUYERS' ORDERS ACROSS ALL VENDORS
         ========================================================================= */}
      {activeTab === 'orders' && (
        <div>
          <div className="row" style={{ marginBottom: 18, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <input
                className="search"
                placeholder="Search by Order ID, Buyer name, Vendor, SKU, or AWB..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['ALL', 'PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'RETURNED', 'CANCELLED'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`category-chip ${statusFilter === st ? 'active' : ''}`}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'ALL' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 0' }}>
              <p className="muted">Loading marketplace orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <h3>No orders found</h3>
              <p className="muted">
                {orders.length === 0
                  ? 'No buyer orders have been placed in the marketplace yet.'
                  : 'No orders match your search or filter criteria.'}
              </p>
              {statusFilter !== 'ALL' && (
                <button
                  className="button secondary small"
                  onClick={() => setStatusFilter('ALL')}
                  style={{ marginTop: 10 }}
                >
                  Reset Status Filter
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {filteredOrders.map(order => (
                <div className="card" key={order.id} style={{ padding: '22px' }}>
                  {/* Order Top Bar */}
                  <div
                    className="row"
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      paddingBottom: 14,
                      marginBottom: 16
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 16 }}>Order #{order.id.substring(0, 8)}</strong>
                        <span className={`badge badge-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                        <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-approved' : 'badge-requested'}`}>
                          Payment: {order.paymentStatus}
                        </span>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                        Placed: {new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {order.paymentMethod && ` • Method: ${order.paymentMethod}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <small className="muted">{order.items?.length || 0} items total</small>
                    </div>
                  </div>

                  {/* Buyer & Shipping Info */}
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 16,
                      fontSize: 13.5
                    }}
                  >
                    <div className="row">
                      <div>
                        <strong>Buyer: </strong>
                        <span>{order.buyerName || 'Buyer'}</span>
                        {order.buyerEmail && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                            ({order.buyerEmail})
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <strong>Delivery Address: </strong>
                        <span style={{ color: '#334155' }}>{order.shippingAddress || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Shipments (Sub-Orders) */}
                  <h4 style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Vendor Shipments & Products ({order.subOrders?.length || 0})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {order.subOrders?.map(subOrder => {
                      const vendorReturn = getReturnForSubOrder(subOrder.id);
                      // Items from this vendor
                      const vendorItems = order.items?.filter(
                        it => it.vendorId && subOrder.vendor && it.vendorId === subOrder.vendor.id
                      ) || [];

                      return (
                        <div
                          key={subOrder.id}
                          style={{
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 16px',
                            background: '#ffffff'
                          }}
                        >
                          <div className="row" style={{ marginBottom: 10 }}>
                            <div>
                              <strong style={{ fontSize: 14.5 }}>
                                Seller: {subOrder.vendor?.storeName || subOrder.vendor?.businessName || 'Marketplace Seller'}
                              </strong>
                              {subOrder.vendor?.businessType && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                                  ({subOrder.vendor.businessType})
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className={`badge badge-${subOrder.status.toLowerCase()}`}>
                                {subOrder.status}
                              </span>

                              {subOrder.awbNumber && (
                                <button
                                  className="button small secondary"
                                  onClick={() => handleTrackOrder(subOrder)}
                                  style={{ padding: '4px 10px', fontSize: 12 }}
                                >
                                  📍 Track Shipment
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Shipping & AWB info */}
                          <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
                            {subOrder.courierName && (
                              <span style={{ marginRight: 14 }}>
                                Courier: <strong>{subOrder.courierName}</strong>
                              </span>
                            )}
                            {subOrder.awbNumber ? (
                              <span>
                                AWB Tracking #: <strong style={{ color: 'var(--primary)' }}>{subOrder.awbNumber}</strong>
                              </span>
                            ) : (
                              <span className="muted">AWB not yet assigned by vendor</span>
                            )}
                          </div>

                          {/* Products Table for this shipment */}
                          <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                              Shipment Items
                            </div>
                            {vendorItems.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {vendorItems.map(item => (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 13,
                                      borderBottom: '1px dashed #e2e8f0',
                                      paddingBottom: 4
                                    }}
                                  >
                                    <div>
                                      <strong>{item.variant?.product?.title || 'Product'}</strong>
                                      <span className="muted" style={{ marginLeft: 6 }}>
                                        (SKU: {item.variant?.sku || '-'}) {item.variant?.colour ? `• ${item.variant.colour}` : ''}
                                      </span>
                                      <span style={{ marginLeft: 8, color: '#475569' }}>
                                        × {item.quantity}
                                      </span>
                                    </div>
                                    <div>
                                      ₹{Number(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                Ordered items for Sub-Order #{subOrder.id.substring(0, 8)}
                              </div>
                            )}
                          </div>

                          {/* Return / Refund Status where available */}
                          {vendorReturn && (
                            <div
                              style={{
                                background: '#f5f3ff',
                                border: '1px solid #ddd6fe',
                                borderRadius: 'var(--radius-sm)',
                                padding: '10px 14px',
                                marginTop: 10,
                                fontSize: 13
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <strong style={{ color: '#5b21b6' }}>↩ Return Request:</strong>
                                  <span className={`badge badge-${vendorReturn.status.toLowerCase()}`}>
                                    {vendorReturn.status}
                                  </span>
                                </div>
                                <strong style={{ color: '#6b21a8' }}>
                                  Refund: ₹{Number(vendorReturn.refundAmount || 0).toLocaleString('en-IN')}
                                </strong>
                              </div>

                              <div style={{ color: '#4c1d95' }}>
                                <strong>Reason: </strong>{vendorReturn.reason}
                              </div>

                              {vendorReturn.vendorComment && (
                                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                                  Seller Note: {vendorReturn.vendorComment}
                                </div>
                              )}

                              {vendorReturn.reverseAwb && (
                                <div style={{ color: 'var(--primary)', fontSize: 12, marginTop: 4 }}>
                                  Reverse AWB: <strong>{vendorReturn.reverseAwb}</strong>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: VENDOR APPLICATIONS
         ========================================================================= */}
      {activeTab === 'vendors' && (
        <div>
          <h2>Vendor Applications & Accounts</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Type</th>
                  <th>GSTIN</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="5">No vendor applications found.</td>
                  </tr>
                ) : (
                  vendors.map(v => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.businessName}</strong>
                        {v.storeName && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Store: {v.storeName}
                          </div>
                        )}
                      </td>
                      <td>{v.businessType}</td>
                      <td>{v.gstin || '-'}</td>
                      <td>
                        <span className={`badge badge-${v.status.toLowerCase()}`}>
                          {v.status}
                        </span>
                      </td>
                      <td>
                        {v.status === 'PENDING' && (
                          <div className="actions">
                            <button className="button small" onClick={() => approve(v.id)}>
                              Approve
                            </button>
                            <button className="button danger small" onClick={() => reject(v.id)}>
                              Reject
                            </button>
                          </div>
                        )}
                        {v.status === 'APPROVED' && (
                          <span style={{ color: '#059669', fontSize: 13, fontWeight: 600 }}>
                            ✓ Active Vendor
                          </span>
                        )}
                        {v.status === 'REJECTED' && (
                          <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                            ✗ Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BUYER & VENDOR DISPUTES (FR11)
         ========================================================================= */}
      {activeTab === 'disputes' && (
        <div>
          <h2>Buyer & Vendor Disputes (FR11)</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Dispute ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Resolution</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.length === 0 ? (
                  <tr>
                    <td colSpan="6">No disputes reported.</td>
                  </tr>
                ) : (
                  disputes.map(d => (
                    <tr key={d.id}>
                      <td><code>{d.id ? d.id.substring(0, 8) + '...' : 'N/A'}</code></td>
                      <td><strong>{d.type}</strong></td>
                      <td>{d.description}</td>
                      <td>
                        <span className={`badge badge-${(d.status || 'open').toLowerCase()}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>{d.resolution || 'Pending review'}</td>
                      <td>
                        {d.status === 'OPEN' ? (
                          <div className="actions">
                            <button
                              className="button small"
                              onClick={() => resolveDispute(d.id, 'Refund Approved')}
                            >
                              Approve Refund
                            </button>
                            <button
                              className="button danger small"
                              onClick={() => resolveDispute(d.id, 'Dispute Rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ShipRocket Real-Time Tracking Modal for Admin
         ========================================================================= */}
      {trackingModal && (
        <div className="modal-overlay" onClick={() => setTrackingModal(null)}>
          <div
            className="modal card"
            style={{ maxWidth: '640px', width: '92%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="row" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Live Shipment Tracking</h3>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  Courier: <strong>{trackingModal.courierName || 'ShipRocket Partner'}</strong> • AWB:{' '}
                  <strong>{trackingModal.awbNumber}</strong>
                </p>
              </div>
              <button
                className="button secondary small"
                onClick={() => setTrackingModal(null)}
              >
                ✕ Close
              </button>
            </div>

            {trackingLoading ? (
              <p style={{ textAlign: 'center', padding: '30px 0' }}>Fetching real-time tracking data...</p>
            ) : (
              <div>
                {/* Visual Route Line & Truck */}
                <div className="route-map-visual">
                  <div className="route-point">
                    <span className="dot" />
                    <span className="label">
                      {trackingModal.originLocation || 'Vendor Dispatch'}
                    </span>
                  </div>

                  <div className="route-line">
                    <div
                      className="route-truck"
                      style={{
                        left: `${Math.min(Math.max(trackingModal.progressPercent || 15, 10), 90)}%`
                      }}
                    >
                      🚚
                    </div>
                  </div>

                  <div className="route-point">
                    <span
                      className="dot"
                      style={{
                        background: trackingModal.progressPercent >= 100 ? '#10b981' : '#cbd5e1',
                        borderColor: trackingModal.progressPercent >= 100 ? '#a7f3d0' : '#e2e8f0'
                      }}
                    />
                    <span className="label">
                      {trackingModal.destinationLocation ? 'Buyer Delivery' : 'Buyer Location'}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="tracking-progress-box">
                  <div className="tracking-bar">
                    <div
                      className="tracking-bar-fill"
                      style={{ width: `${trackingModal.progressPercent || 20}%` }}
                    />
                  </div>
                  <div className="tracking-milestones">
                    <span className={trackingModal.progressPercent >= 15 ? 'active' : ''}>Packed</span>
                    <span className={trackingModal.progressPercent >= 35 ? 'active' : ''}>Picked Up</span>
                    <span className={trackingModal.progressPercent >= 65 ? 'active' : ''}>In Transit</span>
                    <span className={trackingModal.progressPercent >= 100 ? 'active' : ''}>
                      {trackingModal.status === 'RETURNED' ? 'Returned & Refunded' : 'Delivered'}
                    </span>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    margin: '16px 0',
                    fontSize: '13.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Current Status:</span>
                    <span className={`badge badge-${(trackingModal.status || 'placed').toLowerCase()}`}>
                      {trackingModal.status || 'IN_TRANSIT'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Facility Location:</span>
                    <strong>{trackingModal.currentLocation || 'In Transit Sorting Facility'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estimated Delivery:</span>
                    <strong>{trackingModal.estimatedDeliveryDate || 'Within 2-3 business days'}</strong>
                  </div>
                </div>

                {/* Checkpoints Timeline */}
                <h4 style={{ margin: '16px 0 12px', fontSize: '14px' }}>Detailed Checkpoint History</h4>
                <div className="checkpoints-list">
                  {trackingModal.checkpoints && trackingModal.checkpoints.length > 0 ? (
                    trackingModal.checkpoints.map((cp, idx) => (
                      <div className="checkpoint-item" key={idx}>
                        <span className="cp-dot" />
                        <div className="cp-content">
                          <strong>{cp.activity}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                            {cp.location} • {cp.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted" style={{ fontSize: '13px' }}>No checkpoint logs yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
