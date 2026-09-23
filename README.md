# NoneKnow

**Secure self-destructing messages.**

Share sensitive information safely. Messages are encrypted and automatically deleted after being viewed or when they expire.

🔗 **Live Demo**: [https://none-know.vercel.app](https://none-know.vercel.app)

---

## Features

- End-to-end encrypted messages
- Self-destruct after a set number of views
- Optional expiration time (minutes / hours / days)
- No account required
- Clean and simple interface

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **API**: tRPC
- **Database**: MongoDB + Mongoose
- **Encryption**: Node.js Crypto
- **Styling**: Tailwind CSS
- **Icons**: React Icons

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shaishab316/none-know.git
cd none-know
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
none-know/
├── app/                  # Next.js App Router
│   ├── page.tsx          # Create message page
│   └── read/[id]/[key]  # Read message page
├── components/           # Shared components
├── lib/                  # Database & crypto utilities
├── models/               # Mongoose models
├── server/               # tRPC routers
├── shared/               # Shared schemas (Zod)
└── utils/                # Client-side utilities
```

---

## How it works

1. User creates a message and sets optional view limit / expiration.
2. Message is encrypted on the server and stored in MongoDB.
3. A unique link is generated containing the message ID and decryption key.
4. When someone opens the link, the message is decrypted and the view count is increased.
5. Message is automatically deleted when the view limit is reached or it expires.

---

## License

MIT
