<div align="center">
  <h1>📚 Toddler Reads</h1>
  <p>
    <strong>Empowering early literacy through interactive play.</strong>
  </p>
  <p>
    An interactive web application designed to help toddlers and young children learn the fundamentals of reading, including phonics, vocabulary, and sentence structure.
  </p>

  <!-- Live Demo Badge / Link -->
  <a href="https://toddler-reads.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy with Vercel"/>
  </a>
</div>

<br />

<!-- Mobile Mockup Display 
     Since the image is very tall, we center it and restrict width to roughly 
     the size of a real phone screen to keep the readme readable. -->
<div align="center">
  <img src="https://github.com/user-attachments/assets/49b32ea7-397a-417e-96f5-9c43b4bdf8c7" alt="Toddler Reads Mobile Interface" width="280" />
</div>

<br />

## ✨ Features

Designed with little fingers in mind, the app focuses on intuitive touch interactions and audio feedback.

*   **🔊 Phonics Fun:** Interactive decks with clear audio pronunciation to teach letter sounds and phonemes.
*   **🖼️ Vocabulary Builder:** flashcards that associate new words with engaging images.
*   **🧩 Sentence Construction:** Drag-and-drop or click-based simple sentence building exercises.
*   **🔢 Number Recognition:** A dedicated module for learning numbers and counting.
*   **🗣️ Text-to-Speech:** Instant audio feedback—click any word to hear it spoken.
*   **📱 Responsive Design:** Optimized for mobile/tablet use (perfect for iPads) but works great on desktops.

## 🛠️ Tech Stack

Built with modern web technologies for speed and scalability.

<div align="left">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</div>

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v14+ recommended)
*   [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/toddler-reads.git
    cd toddler-reads
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Start learning:**
    Open your browser and navigate to `http://localhost:5173` (or the address shown in your terminal).

## 📁 Project Structure

```text
toddler-reads/
├── client/
│   ├── src/
│   │   ├── components/   # Reusable UI (PhonicsDeck, VocabCard, etc.)
│   │   ├── data/         # Static JSON data (Word lists, Phonics sounds)
│   │   ├── assets/       # Images, Icons, and MP3s
│   │   ├── pages/        # Main Views (Home, Game Modes)
│   │   └── utils/        # Helper functions (TTS logic, etc.)
│   └── index.html
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Configuration settings
