# Toddler Reads

An interactive and fun web application designed to help toddlers and young children learn the fundamentals of reading, including phonics, vocabulary, and sentence structure.

## ✨ Features

*   **Phonics Fun:** Interactive phonics decks with audio pronunciation to teach letter sounds.
*   **Vocabulary Builder:** Learn new words with matching images.
*   **Sentence Construction:** Simple sentence building exercises.
*   **Number Recognition:** A module for learning numbers.
*   **Text-to-Speech:** Click and hear words and sounds.
*   **Responsive Design:** Works on desktops, tablets, and mobile devices.

## 🛠️ Tech Stack

*   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/toddler-reads.git
    cd toddler-reads
    ```

2.  Install NPM packages:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the address shown in your terminal).

## 📁 Project Structure

```
toddler-reads/
├── client/           # Main frontend application source
│   ├── src/
│   │   ├── components/ # Reusable React components (PhonicsApp, VocabApp, etc.)
│   │   ├── data/       # Static data for lessons (word lists, decks)
│   │   ├── assets/     # Images and other static assets
│   │   └── pages/      # Application pages
│   └── index.html    # Entry point
├── package.json      # Project dependencies and scripts
└── vite.config.ts    # Vite configuration
```
