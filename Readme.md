# Lohono Villa Availability & Pricing – Backend

This project implements backend APIs for villa availability and pricing as part of the Lohono Stays technical assignment.

---

## 🛠 Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- Day.js

---

## 📁 Project Structure

src/
- app.js
- config/
- models/
- routes/
- controllers/
- services/
- seed/

---

## 📦 Setup Instructions

### 1️⃣ Install dependencies
```bash
npm install
2️⃣ Configure environment
Create a .env file in root:

env
Copy code
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lohono_villas
3️⃣ Seed database
bash
Copy code
npm run seed
4️⃣ Start server
bash
Copy code
npm run dev
🔗 API Endpoints
1️⃣ List Villas with Availability
GET /v1/villas/availability

Query Params

check_in (YYYY-MM-DD)

check_out (YYYY-MM-DD)

page

limit

sort

order

Example

bash
Copy code
curl "http://localhost:5000/v1/villas/availability?check_in=2025-01-10&check_out=2025-01-13"
2️⃣ Get Villa Quote
GET /v1/villas/:villa_id/quote

Query Params

check_in

check_out

Example

bash
Copy code
curl "http://localhost:5000/v1/villas/<villa_id>/quote?check_in=2025-01-10&check_out=2025-01-13"
📐 Business Rules
Stay window is [check_in, check_out)

Villa is available only if all nights are available

GST applied at 18%

Missing calendar rows are treated as unavailable

✅ Notes
Server-side pricing and availability computation

Indexes applied on villa_id + date for performance