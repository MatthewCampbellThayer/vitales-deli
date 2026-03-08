import { useState, useEffect, useCallback, useRef } from 'react';

const REFRESH_OPTIONS = [
  { label: '30 sec', ms: 30_000 },
  { label: '1 min', ms: 60_000 },
  { label: '5 min', ms: 300_000 },
];

const STATUS_COLUMNS = [
  { key: 'new', label: 'New Orders', emoji: '🔴', nextStatus: 'in-progress', nextLabel: 'Start →' },
  { key: 'in-progress', label: 'In Progress', emoji: '🟡', nextStatus: 'ready', nextLabel: 'Mark Ready ✓' },
  { key: 'ready', label: 'Ready for Pickup', emoji: '🟢', nextStatus: null, nextLabel: null },
];

const SETTINGS_KEY = 'vitales_kitchen_settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch { return {}; }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeSince(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function timeUntil(iso) {
  const diff = Math.floor((new Date(iso) - Date.now()) / 1000);
  if (diff <= 0) return 'now';
  if (diff < 60) return `in ${diff}s`;
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
}

function formatScheduled(iso) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// Plays a ding using Web Audio API
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

function OrderCard({ order, onAdvance, onDelete, isScheduled }) {
  const [advancing, setAdvancing] = useState(false);
  const col = STATUS_COLUMNS.find(c => c.key === order.status);

  const handleAdvance = async () => {
    if (!col?.nextStatus) return;
    setAdvancing(true);
    await onAdvance(order.id, col.nextStatus);
    setAdvancing(false);
  };

  const borderColor = isScheduled ? 'border-blue-400' :
    order.status === 'new' ? 'border-red-500' :
    order.status === 'in-progress' ? 'border-yellow-400' : 'border-green-500';

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 p-4 animate-fade-in ${borderColor}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-serif text-2xl font-bold text-deli-brown">#{order.orderNumber}</span>
          <p className="font-semibold text-gray-700 mt-0.5">{order.customerName}</p>
          {order.phone && <p className="text-xs text-gray-400">📱 {order.phone}</p>}
        </div>
        <div className="text-right text-xs text-gray-400">
          {isScheduled ? (
            <>
              <p className="text-blue-600 font-medium">{formatScheduled(order.scheduledFor)}</p>
              <p className="text-blue-400">{timeUntil(order.scheduledFor)}</p>
            </>
          ) : (
            <>
              <p>{formatTime(order.createdAt)}</p>
              <p>{timeSince(order.createdAt)}</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {order.items.map((item, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold">{item.quantity}×</span>{' '}
            <span className="text-deli-brown">{item.name}</span>
            <div className="text-xs text-gray-500 ml-4 leading-relaxed">
              <span>{item.bread}</span>
              {item.removedIngredients?.length > 0 && (
                <span className="text-red-500"> · No {item.removedIngredients.join(', ')}</span>
              )}
              {item.addedExtras?.length > 0 && (
                <span className="text-green-600"> · + {item.addedExtras.join(', ')}</span>
              )}
              {item.note && <span className="italic text-gray-400"> · {item.note}</span>}
            </div>
          </div>
        ))}
      </div>

      {!isScheduled && (
        <div className="flex gap-2">
          {col?.nextStatus && (
            <button
              onClick={handleAdvance}
              disabled={advancing}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
                col.nextStatus === 'ready'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              } disabled:opacity-50`}
            >
              {advancing ? '...' : col.nextLabel}
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => onDelete(order.id)}
              className="flex-1 text-sm font-semibold py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Clear ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ settings, onChange, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 modal-animate" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-bold text-deli-brown">Kitchen Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex items-center justify-between">
              <span className="font-medium text-gray-700">🔔 Sound on new order</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled ?? true}
                onChange={e => onChange({ ...settings, soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-deli-red"
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">Plays a ding when new orders arrive on refresh</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              ⏰ Show in active orders when within:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.scheduledThresholdMin ?? 15}
                onChange={e => onChange({ ...settings, scheduledThresholdMin: parseInt(e.target.value) })}
                className="flex-1 accent-deli-olive-mid"
              />
              <span className="w-16 text-right font-semibold text-deli-brown">
                {settings.scheduledThresholdMin ?? 15} min
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Scheduled orders appear in active queue this many minutes before their pickup time</p>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-6">Done</button>
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(REFRESH_OPTIONS[0]);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [barKey, setBarKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => ({
    soundEnabled: true,
    scheduledThresholdMin: 15,
    ...loadSettings(),
  }));
  const prevOrderIdsRef = useRef(null);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      // Check for new orders and play ding
      if (prevOrderIdsRef.current !== null && settings.soundEnabled) {
        const prevIds = prevOrderIdsRef.current;
        const newOrders = data.filter(o => !prevIds.has(o.id) && o.status === 'new');
        if (newOrders.length > 0) playDing();
      }
      prevOrderIdsRef.current = new Set(data.map(o => o.id));

      setOrders(data);
      setLastRefresh(new Date());
      setBarKey(k => k + 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [settings.soundEnabled]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, refreshInterval.ms);
    return () => clearInterval(interval);
  }, [fetchOrders, refreshInterval.ms]);

  const advanceOrder = async (id, status) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchOrders();
  };

  const deleteOrder = async (id) => {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const threshold = (settings.scheduledThresholdMin ?? 15) * 60 * 1000;

  // Split orders: active vs scheduled
  const activeOrders = orders.filter(o => {
    if (o.scheduledFor === 'asap') return true;
    const msUntil = new Date(o.scheduledFor) - Date.now();
    return msUntil <= threshold;
  });

  const scheduledOrders = orders.filter(o => {
    if (o.scheduledFor === 'asap') return false;
    const msUntil = new Date(o.scheduledFor) - Date.now();
    return msUntil > threshold;
  }).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

  const getByStatus = (status) =>
    activeOrders.filter(o => o.status === status)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-deli-olive shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.squarespace-cdn.com/content/v1/5627d9c0e4b0ee82950b3909/1445454242717-8CCZ5SSM8U1HBVDKK4DQ/pacific-dark.png"
                alt="Vitale's"
                className="w-10 h-10 object-contain"
                onError={e => e.currentTarget.style.display='none'}
              />
              <div>
                <h1 className="font-serif text-2xl font-bold text-white">Kitchen Display</h1>
                <p className="text-green-300 text-xs">
                  {activeOrders.length} active · {scheduledOrders.length} scheduled
                  {lastRefresh && ` · ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-300 text-sm">Refresh:</span>
              <div className="flex bg-deli-olive-light rounded-lg overflow-hidden border border-green-800">
                {REFRESH_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => { setRefreshInterval(opt); setBarKey(k => k + 1); }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      refreshInterval.label === opt.label
                        ? 'bg-deli-red text-white'
                        : 'text-green-200 hover:bg-deli-olive-mid'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchOrders}
                className="bg-deli-olive-light text-green-200 border border-green-800 rounded-lg px-3 py-1.5 text-sm hover:bg-deli-olive-mid transition-colors"
              >
                ↻ Now
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-deli-olive-light text-green-200 border border-green-800 rounded-lg px-3 py-1.5 text-sm hover:bg-deli-olive-mid transition-colors"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Sliding progress bar */}
        <div className="h-1 bg-deli-olive-light overflow-hidden">
          <div
            key={barKey}
            className="h-full bg-deli-tan progress-bar-animate"
            style={{ animationDuration: `${refreshInterval.ms}ms` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">⏳</p>
            <p>Loading orders...</p>
          </div>
        ) : (
          <>
            {/* Active orders — 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {STATUS_COLUMNS.map(col => {
                const colOrders = getByStatus(col.key);
                return (
                  <div key={col.key}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                        <span>{col.emoji}</span>
                        <span>{col.label}</span>
                      </h2>
                      <span className="bg-white text-gray-600 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                        {colOrders.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {colOrders.length === 0 ? (
                        <div className="bg-white/60 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                          No orders here
                        </div>
                      ) : (
                        colOrders.map(order => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onAdvance={advanceOrder}
                            onDelete={deleteOrder}
                            isScheduled={false}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scheduled orders section */}
            {scheduledOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-semibold text-gray-600 flex items-center gap-2">
                    <span>📅</span>
                    <span>Scheduled Orders</span>
                  </h2>
                  <span className="bg-blue-100 text-blue-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
                    {scheduledOrders.length}
                  </span>
                  <span className="text-gray-400 text-xs">
                    — moves to active queue {settings.scheduledThresholdMin ?? 15} min before pickup
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {scheduledOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvance={advanceOrder}
                      onDelete={deleteOrder}
                      isScheduled={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {orders.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">🥪</p>
                <p className="text-lg font-medium">No active orders</p>
                <p className="text-sm mt-1">Orders will appear here as they come in</p>
              </div>
            )}
          </>
        )}
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
