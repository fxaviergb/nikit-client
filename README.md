
# NikIT-Client

**NikIT-Client** is an AI-powered frontend platform that processes content to create **quizzes**, **flashcards**, and **personalized learning tools**, aiming to **optimize study sessions** and **improve knowledge retention**.

> Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/), based on the [TailAdmin](https://nextjs-demo.tailadmin.com/) template.

## 🧠 Features

- ✨ AI-driven content generation
- 📚 Quiz and flashcard creation
- 📈 Personalized learning recommendations
- 🎨 Beautiful and responsive UI (Tailwind CSS)
- 🌙 Dark/light theme ready
- 🧩 Modular and scalable component architecture

## 📁 Folder Structure

```
/public_images       Static assets organized by category
/src                 Application source code
  └── components     React UI components
  └── pages          Next.js page routes
  └── styles         TailwindCSS and global styles
  └── utils          Utilities and helper functions
  └── services       API integrations and data fetching
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nikit-client.git
cd nikit-client

# Install dependencies
npm install

# Or in case of errors due to dependency problems
npm install --legacy-peer-deps
```

### Create a `.env.local` file

You need to set up environment variables before running the project. Create a `.env.local` file in the root directory and include the following as an example:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_APP_NAME=NikIT
NEXT_PUBLIC_USE_MOCK=false
```

> Replace the values with your actual API endpoints and configuration values.

### Running the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app in action.

## 🛠️ Scripts

| Script         | Description                    |
|----------------|--------------------------------|
| `dev`          | Runs the app in dev mode       |
| `build`        | Builds the app for production  |
| `start`        | Starts the production server   |
| `lint`         | Lints the project using ESLint |
| `format`       | Formats the code using Prettier|

## ⚙️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Template:** [TailAdmin](https://github.com/TailAdmin/free-nextjs-admin-dashboard)

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🙌 Acknowledgements

- UI powered by [TailAdmin Free Next.js Dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard)

---

