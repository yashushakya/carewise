# CareWise 🩺

CareWise is a full-stack hospital appointment booking platform built on the MERN stack, with an integrated AI health assistant to help users understand symptoms, medical reports, and images before consulting a doctor.

🔗 **Live Demo:** [carewise-neon.vercel.app](https://carewise-neon.vercel.app)

## Features

- **User authentication** — signup/login with JWT-based sessions
- **Doctor & hospital directory** — browse doctors and hospitals with details and ratings
- **Appointment booking** — book, view, and manage appointments
- **Reviews** — rate and review doctors after a visit
- **AI health assistant** — chat-based symptom checker that asks follow-up questions before giving guidance
- **Medical report analysis** — upload a PDF report and get a plain-language summary of key findings
- **Medical image analysis** — upload an image (rash, wound, etc.) for AI-based observations and specialist recommendations
- **User profiles** — manage personal health information (allergies, conditions, vitals)

> ⚠️ The AI assistant provides general guidance only and is not a substitute for professional medical diagnosis.

## Tech stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- React Router DOM
- Axios

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication + bcrypt password hashing
- Multer (file uploads)
- pdf-parse (PDF text extraction)
- OpenRouter API (LLM-powered chat, report, and image analysis)

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

## Project structure

```
carewise/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── appointments.js
│   │   ├── reviews.js
│   │   └── ai.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── DoctorCard.jsx
        │   ├── BookingModal.jsx
        │   └── StarRating.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx / Signup.jsx
        │   ├── Doctors.jsx / Hospitals.jsx
        │   ├── Appointments.jsx / Dashboard.jsx
        │   ├── Reviews.jsx / Profile.jsx
        │   ├── Assistant.jsx / Reports.jsx / ImageAnalysis.jsx
        └── api.jsx
```

## Getting started locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas cluster (or local MongoDB instance)
- An OpenRouter API key ([openrouter.ai](https://openrouter.ai))

### 1. Clone the repo
```bash
git clone https://github.com/your-username/carewise.git
cd carewise
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@yourcluster.mongodb.net/carewise
JWT_SECRET=your_long_random_secret
OPENROUTER_API_KEY=your_openrouter_key
PORT=5000
```

Run the server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

- **Backend** is deployed on [Render](https://render.com), with `MONGO_URI`, `JWT_SECRET`, and `OPENROUTER_API_KEY` set as environment variables.
- **Frontend** is deployed on [Vercel](https://vercel.com), with `VITE_API_URL` pointing to the Render backend, and a rewrite rule for SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- **Database** is hosted on MongoDB Atlas with network access configured for Render's servers.

## API overview

| Route | Description |
|---|---|
| `POST /api/auth/signup` | Create a new account |
| `POST /api/auth/login` | Log in and receive a JWT |
| `GET/PUT /api/profile` | View or update user health profile |
| `GET/POST /api/appointments` | View or book appointments |
| `GET/POST /api/reviews` | View or submit doctor reviews |
| `POST /api/ai/chat` | Chat with the AI health assistant |
| `POST /api/ai/report` | Upload a PDF report for AI analysis |
| `POST /api/ai/image` | Upload an image for AI analysis |

## Disclaimer

CareWise's AI features are intended for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
