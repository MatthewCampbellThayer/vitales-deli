# Vitale's Deli — Online Ordering

A pickup-order website for Vitale's Deli, St. Louis, MO.

## Running Locally

You need two terminals:

### Terminal 1 — Backend (port 3001)
```bash
cd backend
npm start
```

### Terminal 2 — Frontend (port 5173)
```bash
cd frontend
npm run dev
```

Then open:
- **Ordering:** http://localhost:5173
- **Kitchen display:** http://localhost:5173/kitchen

## Features

- Full menu with all 12 sandwiches from vitalesdeli.com
- Customize each sandwich: remove ingredients, add extras, choose bread
- Cart with subtotal (pre-tax) and item count
- Place order with customer name for pickup
- Kitchen display with 3-column Kanban (New → In Progress → Ready)
- Auto-refresh: 30s / 1 min / 5 min selector

## Notes

- Orders are stored in-memory (lost on backend restart) — for production, add a database
- No payment processing — pay at pickup
