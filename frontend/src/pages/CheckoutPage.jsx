import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function getMinDateTime() {
  const d = new Date(Date.now() + 15 * 60 * 1000);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatPhoneDisplay(val) {
  const digits = val.replace(/\D/g, '').substring(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupMode, setPickupMode] = useState('asap'); // 'asap' | 'scheduled'
  const [scheduledTime, setScheduledTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneDisplay(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (pickupMode === 'scheduled' && !scheduledTime) {
      setError('Please select a pickup time.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const rawPhone = phone.replace(/\D/g, '');
    const scheduledFor = pickupMode === 'asap' ? 'asap' : new Date(scheduledTime).toISOString();

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: rawPhone.length >= 10 ? rawPhone : null,
          items: items.map(item => ({
            name: item.name,
            subtitle: item.subtitle,
            price: item.price,
            quantity: item.quantity,
            bread: item.bread,
            removedIngredients: item.removedIngredients,
            addedExtras: item.addedExtras,
            note: item.note,
          })),
          scheduledFor,
        }),
      });

      if (!res.ok) throw new Error('Failed to place order');
      const order = await res.json();
      clearCart();
      navigate(`/confirmation/${order.orderNumber}`, { state: { order } });
    } catch (err) {
      setError('Could not reach the kitchen. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="font-serif text-3xl font-bold text-deli-brown mb-6">Place Your Order</h2>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-deli-cream-dark p-6 mb-6">
        <h3 className="font-semibold text-deli-brown mb-4 text-lg font-serif">Order Summary</h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.cartId} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.quantity}× </span>
                <span>{item.name}</span>
                {item.subtitle && <span className="text-gray-400"> · {item.subtitle}</span>}
                <div className="text-gray-400 text-xs ml-4">
                  {item.bread}
                  {item.removedIngredients.length > 0 && (
                    <span className="text-red-400"> · No {item.removedIngredients.join(', ')}</span>
                  )}
                  {item.addedExtras.length > 0 && (
                    <span className="text-green-600"> · Add {item.addedExtras.join(', ')}</span>
                  )}
                  {item.note && <span className="italic"> · "{item.note}"</span>}
                </div>
              </div>
              <span className="font-semibold text-deli-red ml-4 whitespace-nowrap">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-deli-cream-dark mt-4 pt-4 space-y-1">
          <div className="flex justify-between font-bold text-lg">
            <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
            <span className="text-deli-red">${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400">Tax will be added at pickup · Pay at pickup</p>
        </div>
      </div>

      {/* Customer Info & Pickup */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-deli-cream-dark p-6 space-y-5">
        <h3 className="font-serif font-semibold text-deli-brown text-lg">Your Info</h3>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Name for pickup <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="First name (e.g. Matt)"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-deli-olive-mid transition-colors"
            required
            autoFocus
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Cell phone <span className="text-gray-400 font-normal">(optional — get a text when ready)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(314) 555-0100"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-deli-olive-mid transition-colors"
          />
        </div>

        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Pickup time</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPickupMode('asap')}
              className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                pickupMode === 'asap'
                  ? 'border-deli-olive-mid bg-deli-olive-mid text-white'
                  : 'border-gray-200 text-gray-600 hover:border-deli-olive-mid'
              }`}
            >
              🚀 ASAP
            </button>
            <button
              type="button"
              onClick={() => setPickupMode('scheduled')}
              className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                pickupMode === 'scheduled'
                  ? 'border-deli-olive-mid bg-deli-olive-mid text-white'
                  : 'border-gray-200 text-gray-600 hover:border-deli-olive-mid'
              }`}
            >
              📅 Choose time
            </button>
          </div>

          {pickupMode === 'scheduled' && (
            <div className="mt-3 animate-fade-in">
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                min={getMinDateTime()}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-deli-olive-mid transition-colors"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 15 minutes from now</p>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="btn-primary w-full py-3 text-base"
        >
          {submitting ? 'Sending to kitchen...' : 'Send Order to Kitchen →'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          ← Back to menu
        </button>
      </form>
    </div>
  );
}
