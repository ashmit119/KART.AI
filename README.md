# KART.AI — High-End AI-Driven Marketplace

**KART.AI** is a premier, end-to-end e-commerce ecosystem designed with a minimalist "Apple-style" aesthetic. It leverages the full power of the **MERN stack** and **TanStack Start** to provide a high-performance, AI-integrated shopping experience.

---

## ✨ Key Features

- 🤖 **AI Shopping Assistant**: Integrated **Google Gemini (GenAI)** chatbot to help users find products, track orders, and get personalized recommendations.
- 👁️ **Visual Discovery**: Advanced **Hugging Face** integration for real-time visual search and vector discovery, allowing users to find products through image intelligence.
- 💳 **Seamless Payments**: Full **Stripe** integration with secure checkout flows, webhook handling, and order management.
- 🚀 **Modern Architecture**: Built using **TanStack Start** for robust Server-Side Rendering (SSR) and ultra-fast client-side navigation.
- 🎨 **Premium UI/UX**: Crafted with **Tailwind CSS**, **Framer Motion**, and **Radix UI** for smooth micro-animations and a sophisticated, dark-mode-first design.
- ☁️ **Media Management**: Optimized image hosting and transformations via **Cloudinary**.

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** & **TypeScript**
- **TanStack Start** (Full-stack React framework)
- **TanStack Query** (Server state management)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)

### **Backend**
- **Node.js** & **Express**
- **MongoDB** (via Mongoose)
- **JWT** (Authentication & Authorization)
- **Multer** & **Cloudinary** (File uploads)

### **AI & Third-Party**
- **Google Gemini API** (Conversational AI)
- **Hugging Face Inference API** (Vector search & embeddings)
- **Stripe API** (Payment processing)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Stripe, Cloudinary, and Google GenAI API keys

### 2. Clone the Repository
```bash
git clone [https://github.com/ashmit119/KART.AI.git](https://github.com/ashmit119/KART.AI.git)
cd KART.AI

Environment Setup
Create a .env file in the root directory:

Code snippet
PORT=3000
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_google_gemini_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CLIENT_URL=http://localhost:5173
Create a .env file in the frontend directory:

Code snippet
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=KART.AI
4. Installation & Running
Start the Backend:

Bash
# From the root directory
npm install
npm run dev
Start the Frontend:

Bash
# From the frontend directory
cd frontend
npm install
npm run dev
📂 Project Structure
Plaintext
├── frontend/               # TanStack Start / React application
│   ├── src/
│   │   ├── components/     # UI Components (Radix, Lucide, etc.)
│   │   ├── routes/         # TanStack Router file-based routes
│   │   ├── lib/            # Context & API utilities
│   │   └── styles/         # Tailwind CSS configurations
├── src/                    # Node.js Backend
│   ├── models/             # Mongoose schemas (User, Product, Order)
│   ├── routes/             # Express API endpoints
│   ├── services/           # AI & Payment logic
│   └── middleware/         # Auth & error handling
└── server.js               # Entry point
🛡️ License
This project is licensed under the ISC License.
Developed by Ashmit Banerjee
