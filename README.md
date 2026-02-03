<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WYY AURA Personal Media Hub

A personal media hub featuring music, videos, and premium content.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file and add your environment variables (see `.env.example`)
3. Run the app:
   `npm run dev`

---

## Payment Integration

This project supports integrating with an external payment tracker that exposes:
- `POST /api/orders` to create an order (body `{ amount: "9.9" }`) and returns an `orderNo` and `status: "pending"`.
- `GET /api/orders/:orderNo` to check status (returns `status` and optional `txHash`).

Configuration:
- `NEXT_PUBLIC_PAYMENT_API_URL` (client-facing base URL).
- `PAYMENT_API_URL` (optional, server-side proxy URL — recommended to avoid CORS).
- `SUPABASE_SERVICE_ROLE_KEY` (optional server-only key to persist subscription records in Supabase when payments are confirmed).

Behavior:
- The app creates an order, instructs the user to send USDT with the `Memo` set to the generated `orderNo`, then checks status and persists subscription when `status === 'paid'`.

