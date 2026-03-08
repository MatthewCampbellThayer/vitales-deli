import { useLocation, useNavigate, useParams } from 'react-router-dom';

function formatScheduledTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ConfirmationPage() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;
  const isScheduled = order?.scheduledFor && order.scheduledFor !== 'asap';

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-7xl mb-4">{isScheduled ? '📅' : '🎉'}</div>
      <h2 className="font-serif text-3xl font-bold text-deli-brown mb-2">Order Received!</h2>
      <p className="text-gray-500 mb-6">
        {isScheduled
          ? `Scheduled for ${formatScheduledTime(order.scheduledFor)}`
          : "We're making it fresh for you."}
      </p>

      <div className="bg-deli-olive text-white rounded-2xl p-6 mb-8 shadow-lg">
        <p className="text-green-300 text-sm uppercase tracking-widest mb-1">Order Number</p>
        <p className="font-serif text-6xl font-bold">#{orderNumber}</p>
        {order?.customerName && (
          <p className="text-green-200 mt-2">for {order.customerName}</p>
        )}
        {isScheduled && (
          <p className="text-yellow-200 text-sm mt-2 font-medium">
            ⏰ Pickup: {formatScheduledTime(order.scheduledFor)}
          </p>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-xl shadow-sm border border-deli-cream-dark p-5 mb-8 text-left">
          <h3 className="font-semibold text-deli-brown mb-3 font-serif">Your order:</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="text-sm text-gray-600">
                <span className="font-medium text-deli-brown">{item.quantity}× {item.name}</span>
                {item.subtitle && <span className="text-gray-400"> · {item.subtitle}</span>}
                <div className="text-xs text-gray-400 ml-4">
                  {item.bread}
                  {item.removedIngredients?.length > 0 && (
                    <span className="text-red-400"> · No {item.removedIngredients.join(', ')}</span>
                  )}
                  {item.addedExtras?.length > 0 && (
                    <span className="text-green-600"> · Add {item.addedExtras.join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order?.phone && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-sm text-green-700">
          📱 Confirmation text sent · We'll text you when ready
        </div>
      )}

      <div className="bg-deli-cream rounded-xl p-4 mb-8 text-sm text-gray-600">
        <p>📍 <strong>425 Sappington Rd</strong>, St. Louis, MO 63122</p>
        <p className="mt-1 text-gray-400">Pay when you pick up · Prices before tax</p>
      </div>

      <button onClick={() => navigate('/')} className="btn-primary px-8 py-3">
        Order More →
      </button>
    </div>
  );
}
