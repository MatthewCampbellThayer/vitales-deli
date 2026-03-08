require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Twilio SMS (optional) ---
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS enabled');
  } catch (e) {
    console.warn('Twilio init failed:', e.message);
  }
} else {
  console.log('Twilio not configured — SMS will be logged only');
}

function formatPhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return null;
}

async function sendSMS(to, body) {
  const phone = formatPhone(to);
  if (!phone) return;
  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_FROM_NUMBER,
        to: phone,
      });
      console.log(`SMS sent to ${phone}`);
    } catch (e) {
      console.error('SMS send failed:', e.message);
    }
  } else {
    console.log(`[SMS mock] To: ${phone}\n${body}`);
  }
}

function formatOrderSummary(items) {
  return items.map(i => `${i.quantity}x ${i.name.replace(/"/g, '')}`).join(', ');
}

// --- In-memory store ---
let orders = [];
let orderCounter = 1;

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { customerName, phone, items, scheduledFor } = req.body;
  if (!customerName || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = {
    id: uuidv4(),
    orderNumber: orderCounter++,
    customerName,
    phone: phone || null,
    items,
    status: 'new',
    scheduledFor: scheduledFor || 'asap', // 'asap' or ISO datetime string
    createdAt: new Date().toISOString(),
  };
  orders.push(order);

  // Send confirmation SMS
  if (phone) {
    const pickupLine = order.scheduledFor === 'asap'
      ? 'Pickup: ASAP'
      : `Pickup: ${new Date(order.scheduledFor).toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}`;
    await sendSMS(phone,
      `Hi ${customerName}! Order #${order.orderNumber} received at Vitale's Deli. ` +
      `${formatOrderSummary(items)}. ${pickupLine}. Pay at pickup. ` +
      `📍 425 Sappington Rd, St. Louis, MO`
    );
  }

  res.status(201).json(order);
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['new', 'in-progress', 'ready'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;

  // Send "ready" SMS
  if (status === 'ready' && order.phone) {
    await sendSMS(order.phone,
      `Hi ${order.customerName}! 🥪 Order #${order.orderNumber} is ready for pickup at Vitale's Deli! ` +
      `📍 425 Sappington Rd, St. Louis, MO`
    );
  }

  res.json(order);
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  orders = orders.filter(o => o.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Vitale's Deli backend running on http://localhost:${PORT}`);
});
