# NikIT-Client

**NikIT-Client** is an AI-powered frontend platform that processes content to create **quizzes**, **flashcards**, and **personalized learning tools**, aiming to **optimize study sessions** and **improve knowledge retention**.

> Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/), based on the [TailAdmin](https://nextjs-demo.tailadmin.com/) template.

---

## 🧠 Features

- ✨ AI-driven content generation
- 📚 Quiz and flashcard creation
- 📈 Personalized learning recommendations
- 🎨 Beautiful and responsive UI (Tailwind CSS)
- 🌙 Dark/light theme ready
- 🧩 Modular and scalable component architecture

---

## 📁 Folder Structure

```
/public_images       Static assets organized by category
/src                 Application source code
  └── components     React UI components
  └── app            Next.js 13+ App Router structure
  └── styles         TailwindCSS and global styles
  └── utils          Utilities and helper functions
  └── services       API integrations and data fetching
```

---

## 🚀 Getting Started (Local Development)

### 🔧 Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nikit-client.git
cd nikit-client

# Install dependencies
npm install

# Or in case of errors
npm install --legacy-peer-deps
```

### ⚙️ Create `.env.local`

Create a `.env.local` file in the root folder with your configuration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=NikIT
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_ENABLE_TOKEN_REFRESH=true
```

### ▶️ Run development server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Running with Docker

### 📁 Docker files included:

- `Dockerfile` – Build and run the app
- `docker-compose.yml` – Default config (production)
- `docker-compose.override.yml` – Overrides for development
- `.env.production`, `.env.development` – Environment variables per stage

---

### ⚙️ Docker: Build and Run (Production)

```bash
# Build and run in detached mode
docker-compose up --build -d

# Access the app
http://localhost:3000
```

Uses `.env.production` and `NODE_ENV=production` by default.

---

### 🧪 Docker: Run in Development Mode

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build -d
```

Uses `.env.development` and `NODE_ENV=development`.

> You can switch environments by modifying or extending `docker-compose.override.yml`.

---

### 🛑 Stopping and Cleaning

```bash
# Stop containers
docker-compose down

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🛠️ Scripts

| Script         | Description                    |
|----------------|--------------------------------|
| `dev`          | Runs the app in dev mode       |
| `build`        | Builds the app for production  |
| `start`        | Starts the production server   |
| `lint`         | Lints the project using ESLint |
| `format`       | Formats the code using Prettier|

---

## ⚙️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Template:** [TailAdmin](https://github.com/TailAdmin/free-nextjs-admin-dashboard)

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 🙌 Acknowledgements

- UI powered by [TailAdmin Free Next.js Dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard)