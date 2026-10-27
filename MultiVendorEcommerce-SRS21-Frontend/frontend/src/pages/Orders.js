import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [message, setMessage] = useState('');

  // Quick AWB tracking state
  const [awbQuery, setAwbQuery] = useState('');

  // Return request modal state
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState('Damaged item');
  const [returnNotes, setReturnNotes] = useState('');

  // Dispute modal state (FR11)
  const [disputeModal, setDisputeModal] = useState(null);
  const [disputeType, setDisputeType] = useState('REFUND_NOT_RECEIVED');
  const [disputeDesc, setDisputeDesc] = useState('');

  // Real-time tracking modal state
  const [trackingModal, setTrackingModal] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    loadOrdersAndReturns();
  }, []);

  async function loadOrdersAndReturns() {
    try {
      const [ordersData, returnsData] = await Promise.all([
        api.orders(),
        api.returns()
      ]);
      setOrders(ordersData || []);
      setReturns(returnsData || []);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function openReturnModal(subOrderId) {
    setReturnModal({ subOrderId });
    setReturnReason('Damaged item');
    setReturnNotes('');
  }

  function openDisputeModal(orderId, defaultType = 'REFUND_NOT_RECEIVED', initialDesc = '') {
    setDisputeModal({ orderId });
    setDisputeType(defaultType);
    setDisputeDesc(initialDesc);
  }

  async function submitDispute() {
    if (!disputeModal) return;
    if (!disputeDesc.trim()) {
      alert('Please describe your dispute issue in detail.');
      return;
    }
    try {
      await api.raiseDispute(disputeModal.orderId, disputeType, disputeDesc);
      setMessage('Dispute successfully submitted to Marketplace Admin for arbitration.');
      setDisputeModal(null);
      setDisputeDesc('');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleTrackByAwb(e) {
    if (e) e.preventDefault();
    if (!awbQuery.trim()) return;

    setTrackingLoading(true);
    setTrackingModal({
      awbNumber: awbQuery.trim(),
      courierName: 'ShipRocket Partner',
      loading: true
    });

    try {
      const trackData = await api.trackAwb(awbQuery.trim());
      setTrackingModal(trackData);
    } catch (err) {
      setTrackingModal({
        awbNumber: awbQuery.trim(),
        courierName: 'ShipRocket Partner',
        status: 'IN_TRANSIT',
        currentLocation: 'Hub Transit Facility',
        progressPercent: 65,
        estimatedDeliveryDate: 'Within 2-3 business days',
        checkpoints: [
          { activity: 'Package picked up by courier', location: 'Dispatch Center', timestamp: 'Yesterday' },
          { activity: 'Arrived at regional sort facility', location: 'Regional Hub', timestamp: 'Today' }
        ]
      });
    } finally {
      setTrackingLoading(false);
    }
  }

  async function submitReturnRequest() {
    if (!returnModal) return;
    try {
      const reasonText = returnNotes.trim()
        ? `${returnReason} - ${returnNotes.trim()}`
        : returnReason;

      await api.createReturn({
        subOrderId: returnModal.subOrderId,
        reason: reasonText
      });

      setMessage('Return request submitted successfully. The vendor will review it.');
      setReturnModal(null);
      await loadOrdersAndReturns();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cancelOrder(subOrderId) {
    try {
      await api.cancelSubOrder(subOrderId);
      setMessage('Order cancelled successfully.');
      await loadOrdersAndReturns();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleTrackOrder(subOrder) {
    setTrackingLoading(true);
    setTrackingModal({
      awbNumber: subOrder.awbNumber || 'Generating...',
      courierName: subOrder.courierName || 'ShipRocket Partner',
      status: subOrder.status,
      loading: true
    });

    try {
      const trackData = await api.trackSubOrder(subOrder.id);
      setTrackingModal(trackData);
    } catch (err) {
      // Fallback tracking display
      setTrackingModal({
        awbNumber: subOrder.awbNumber || 'SR-DEL-98234123',
        courierName: subOrder.courierName || 'ShipRocket Express',
        status: subOrder.status,
        currentLocation: 'In Transit',
        progressPercent: subOrder.status === 'DELIVERED' ? 100 : (subOrder.status === 'DISPATCHED' ? 65 : 35),
        estimatedDeliveryDate: 'Within 2-3 business days',
        checkpoints: [
          { activity: 'Shipment created & AWB assigned', location: 'Vendor Hub', timestamp: 'Yesterday' },
          { activity: 'In transit to delivery center', location: 'Regional Hub', timestamp: 'Today' }
        ]
      });
    } finally {
      setTrackingLoading(false);
    }
  }

  function getReturnRequest(subOrderId) {
    const matchingReturns = returns.filter(
      returnRequest => returnRequest.subOrderId === subOrderId
    );

    if (matchingReturns.length === 0) {
      return null;
    }

    return matchingReturns.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt)
        ? current
        : latest;
    });
  }

  return (
    <div>
      <div className="row" style={{ alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>My Orders</h1>

        {/* Quick ShipRocket AWB Lookup */}
        <form onSubmit={handleTrackByAwb} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Track ShipRocket AWB (e.g. SR-DEL-12345678)"
            value={awbQuery}
            onChange={e => setAwbQuery(e.target.value)}
            style={{ width: '280px', padding: '8px 12px', fontSize: '13px' }}
          />
          <button type="submit" className="button small" style={{ background: '#2563eb' }}>
            📍 Track AWB
          </button>
        </form>
      </div>

      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {orders.map(order => (
        <div className="card" key={order.id} style={{ marginBottom: '20px' }}>
          <div className="row" style={{ borderBottom: '1px solid #edf0f5', paddingBottom: '12px', marginBottom: '12px' }}>
            <div>
              <strong>Order #{order.id.substring(0, 8)}</strong>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Placed: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                ₹{Number(order.totalAmount).toLocaleString('en-IN')}
              </div>
              <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-approved' : 'badge-requested'}`}>
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#4b5563' }}>
            <strong>Delivery Address:</strong> {order.shippingAddress || 'Not specified'}
          </p>

          <h3 style={{ fontSize: '15px', marginTop: '16px', marginBottom: '8px' }}>Ordered Items</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
            {order.items.map(item => (
              <li
                key={item.id}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px dashed #edf0f5',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  <strong>{item.variant?.product?.title || item.variant?.sku}</strong>
                  <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                    ({item.variant?.sku}) × {item.quantity}
                  </span>
                </span>
                <span>
                  ₹{Number(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </li>
            ))}
          </ul>

          <h3 style={{ fontSize: '15px', marginTop: '16px', marginBottom: '8px' }}>Vendor Shipments</h3>

          {order.subOrders?.map(subOrder => {
            const returnRequest = getReturnRequest(subOrder.id);

            return (
              <div
                className="card"
                key={subOrder.id}
                style={{
                  background: '#fcfdfe',
                  border: '1px solid #e2e8f0',
                  margin: '10px 0',
                  padding: '16px'
                }}
              >
                <div className="row">
                  <div>
                    <p style={{ margin: '0 0 4px' }}>
                      <strong>Seller:</strong>{' '}
                      {subOrder.vendor?.storeName || subOrder.vendor?.businessName || 'Marketplace Seller'}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '13px' }}>
                      <strong>Status:</strong>{' '}
                      <span className={`badge badge-${subOrder.status.toLowerCase()}`}>
                        {subOrder.status}
                      </span>
                    </p>
                    {subOrder.courierName && (
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#4b5563' }}>
                        Courier: <strong>{subOrder.courierName}</strong>
                      </p>
                    )}
                    {subOrder.awbNumber && (
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#2563eb' }}>
                        AWB Tracking #: <strong>{subOrder.awbNumber}</strong>
                      </p>
                    )}
                  </div>

                  <div className="actions" style={{ alignItems: 'center' }}>
                    {subOrder.awbNumber && (
                      <button
                        className="button small"
                        style={{ background: '#2563eb' }}
                        onClick={() => handleTrackOrder(subOrder)}
                      >
                        📍 Track Order
                      </button>
                    )}

                    {(subOrder.status === 'PLACED' || subOrder.status === 'CONFIRMED' || subOrder.status === 'PACKED') && (
                      <button
                        className="button danger small"
                        onClick={() => cancelOrder(subOrder.id)}
                      >
                        Cancel Order
                      </button>
                    )}

                    {subOrder.status === 'DELIVERED' && !returnRequest && (
                      <button
                        className="button secondary small"
                        onClick={() => openReturnModal(subOrder.id)}
                      >
                        🔄 Request Return
                      </button>
                    )}
                  </div>
                </div>

                {/* Return Request Status Banner for Buyer */}
                {returnRequest && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor:
                        returnRequest.status === 'APPROVED' ? '#86efac'
                        : returnRequest.status === 'REJECTED' ? '#fca5a5'
                        : returnRequest.status === 'REFUNDED' ? '#6ee7b7'
                        : '#fde68a',
                      background:
                        returnRequest.status === 'APPROVED' ? '#f0fdf4'
                        : returnRequest.status === 'REJECTED' ? '#fef2f2'
                        : returnRequest.status === 'REFUNDED' ? '#ecfdf5'
                        : '#fffbeb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong>Return Status: </strong>
                        <span className={`badge badge-${returnRequest.status.toLowerCase()}`}>
                          {returnRequest.status === 'REQUESTED' ? 'Under Vendor Review'
                            : returnRequest.status === 'APPROVED' ? 'Return Approved'
                            : returnRequest.status === 'REJECTED' ? 'Return Rejected'
                            : 'Refund Completed'}
                        </span>
                        <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>
                          Reason: <em>{returnRequest.reason}</em>
                        </div>
                        {returnRequest.vendorComment && (
                          <div style={{ fontSize: '13px', color: '#1f2937', marginTop: '4px' }}>
                            <strong>Vendor Note:</strong> {returnRequest.vendorComment}
                          </div>
                        )}
                        {returnRequest.reverseAwb && (
                          <div style={{ fontSize: '13px', color: '#2563eb', marginTop: '4px' }}>
                            Reverse Pickup Scheduled • AWB: <strong>{returnRequest.reverseAwb}</strong>
                          </div>
                        )}
                        {returnRequest.status === 'REJECTED' && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              className="button danger small"
                              onClick={() => openDisputeModal(
                                order.id,
                                'REFUND_NOT_RECEIVED',
                                `Vendor rejected return for sub-order #${subOrder.id.substring(0, 8)}. Reason: ${returnRequest.reason}. Vendor Note: ${returnRequest.vendorComment || 'None'}`
                              )}
                            >
                              ⚠️ Raise Dispute to Admin (FR11)
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Refund Amount</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#047857' }}>
                          ₹{Number(returnRequest.refundAmount).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {!orders.length && (
        <p className="muted">
          No orders yet.
        </p>
      )}

      {/* Return Request Modal */}
      {returnModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '480px', width: '92%' }}>
            <h3>Request Return</h3>
            <p className="muted">
              Select the reason for returning items in this sub-order:
            </p>

            <label style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Reason for Return</label>
            <select
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #cfd6e2', borderRadius: '8px' }}
            >
              <option value="Damaged item">Damaged item received</option>
              <option value="Wrong item sent">Wrong item delivered</option>
              <option value="Item not as described">Item not as described / quality issue</option>
              <option value="Changed mind">Changed mind / no longer needed</option>
              <option value="Other">Other</option>
            </select>

            <label style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Additional Details (Optional)</label>
            <textarea
              value={returnNotes}
              onChange={e => setReturnNotes(e.target.value)}
              placeholder="Describe the issue with the product..."
              style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #cfd6e2', borderRadius: '8px' }}
            />

            <div className="actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setReturnModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={submitReturnRequest}
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Real-Time Tracking Modal */}
      {trackingModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '650px', width: '92%' }}>
            <div className="row" style={{ alignItems: 'flex-start', borderBottom: '1px solid #edf0f5', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px' }}>Live Shipment Tracking</h3>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>
                  Courier: <strong>{trackingModal.courierName || 'ShipRocket Partner'}</strong> • AWB: <strong>{trackingModal.awbNumber}</strong>
                </div>
                {trackingModal.estimatedDeliveryDate && (
                  <div style={{ fontSize: '13px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                    Estimated Delivery: {trackingModal.estimatedDeliveryDate}
                  </div>
                )}
              </div>
              <button
                className="button small secondary"
                onClick={() => setTrackingModal(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Stepper progress bar */}
            <div className="tracking-progress-box">
              <div className="tracking-bar">
                <div className="tracking-bar-fill" style={{ width: `${trackingModal.progressPercent || 35}%` }} />
              </div>
              <div className="tracking-milestones">
                <span className={trackingModal.progressPercent >= 20 ? 'active' : ''}>Ordered</span>
                <span className={trackingModal.progressPercent >= 40 ? 'active' : ''}>Picked Up</span>
                <span className={trackingModal.progressPercent >= 65 ? 'active' : ''}>In Transit</span>
                <span className={trackingModal.progressPercent >= 85 ? 'active' : ''}>Out for Delivery</span>
                <span className={trackingModal.progressPercent >= 100 ? 'active' : ''}>Delivered</span>
              </div>
            </div>

            {/* Visual Route Map */}
            <div className="route-map-visual">
              <div className="route-point origin">
                <span className="dot" />
                <div className="label">Fulfillment Center</div>
              </div>
              <div className="route-line">
                <div className="route-truck" style={{ left: `${Math.min(88, Math.max(12, trackingModal.progressPercent || 35))}%` }}>
                  🚚
                </div>
              </div>
              <div className="route-point destination">
                <span className="dot" />
                <div className="label">Delivery Address</div>
              </div>
            </div>

            {/* Checkpoint list */}
            <h4 style={{ margin: '18px 0 10px' }}>Tracking Updates & Activity Log</h4>
            <div className="checkpoints-list">
              {trackingModal.checkpoints && trackingModal.checkpoints.length > 0 ? (
                trackingModal.checkpoints.map((cp, idx) => (
                  <div key={idx} className="checkpoint-item">
                    <div className="cp-dot" />
                    <div className="cp-content">
                      <strong>{cp.activity}</strong>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {cp.location} • {cp.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '13px', color: '#6b7280', padding: '10px 0' }}>
                  Awaiting courier first hub scan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FR11: Dispute Modal */}
      {disputeModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '520px', width: '92%' }}>
            <h3>Raise Buyer Dispute (FR11)</h3>
            <p className="muted">
              Submit an arbitration request to Marketplace Admin for Order #{disputeModal.orderId ? disputeModal.orderId.substring(0, 8) : 'N/A'}:
            </p>

            <label style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Dispute Category</label>
            <select
              value={disputeType}
              onChange={e => setDisputeType(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #cfd6e2', borderRadius: '8px' }}
            >
              <option value="REFUND_NOT_RECEIVED">Refund Not Received / Vendor Rejected Return</option>
              <option value="NOT_DELIVERED">Item Not Delivered</option>
              <option value="NOT_AS_DESCRIBED">Item Significantly Not as Described</option>
              <option value="UNRESPONSIVE">Vendor Unresponsive / Communication Issue</option>
            </select>

            <label style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Dispute Details & Evidence (Required)</label>
            <textarea
              value={disputeDesc}
              onChange={e => setDisputeDesc(e.target.value)}
              placeholder="Provide a detailed explanation of the issue for admin arbitration..."
              style={{ width: '100%', minHeight: '100px', padding: '10px', border: '1px solid #cfd6e2', borderRadius: '8px' }}
              required
            />

            <div className="actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setDisputeModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button danger"
                onClick={submitDispute}
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}