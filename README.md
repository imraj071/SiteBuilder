# AI Site Builder 🤖

A full-stack AI-powered website builder where users can generate websites through chat and prompts, refine them via conversation or manual edits, download the code, and roll back to previous versions.

🔗 **Live Demo:** [site-builder-rho-wheat.vercel.app](https://site-builder-rho-wheat.vercel.app/)

---

## Features

**User**
- Generate websites instantly via chat and natural language prompts
- Refine and iterate on generated sites through conversation
- Make manual edits directly in the editor
- Download the generated website code
- Roll back to any previous version
- Secure authentication via Better Auth
- Subscription-based access via Stripe

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, shadcn/ui, Vite |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (via Prisma ORM) |
| Authentication | Better Auth |
| Payments | Stripe |
| AI | OpenAI API |
| Deployment | Vercel |

---

## Project Structure

```
site-builder/
├── client/          # React 19 frontend (Vite + Tailwind CSS v4)
└── server/          # Express 5 + Prisma backend
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL instance (local or cloud)
- Accounts for: OpenAI, Stripe, Better Auth

---

### 1. Clone the repository

```bash
git clone [https://github.com/imraj071/site-builder.git](https://github.com/imraj071/SiteBuilder.git)
cd site-builder
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```dotenv
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=your_better_auth_url
NODE_ENV=development
AI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Run Prisma migrations and start the server:

```bash
npx prisma generate
npx prisma migrate dev
npm run server
```

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in `/client`:

```dotenv
VITE_BASEURL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

---

### 4. Stripe Webhook (local testing)

```bash
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

Copy the printed webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in your backend `.env`.

---

## Deployment

Deployed on **Vercel** (both frontend and backend). Ensure all environment variables listed above are configured under **Settings → Environment Variables** in your Vercel project.
