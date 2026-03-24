# 🚀 TNCP Portfolio & Digital Marketplace

![Banner](https://github.com/duckterkru29/tncp/raw/main/public/logo.png)

A high-performance personal portfolio and source code marketplace built for modern digital architects. Features a sleek **Glassmorphism** design, dynamic content management, and an integrated admin dashboard.

## ✨ Key Features

- **💼 Portfolio Showcase**: Interactive display of projects with filtering by category (Web, Mobile, System).
- **🛒 Source Code Marketplace**: Built-in shopping cart and WhatsApp checkout integration for selling digital assets.
- **📰 Tech Insights (Blog)**: Dynamic article system with Markdown support and code highlighting.
- **🛡️ Secure Admin Panel**: Full content management (CRUD) for projects, articles, and site settings.
- **📱 100% Responsive**: Optimised for all devices from mobile to large desktops.
- **💬 Direct Engagement**: Floating WhatsApp chat and "Let's Talk" CTAs for instant lead conversion.

## 🛠️ Technology Stack

- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Frontend**: Vanilla JS (ES6+), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Database**: JSON-based (Lightweight & Efficient)
- **Editor**: [Marked.js](https://marked.js.org/) for Markdown, [Highlight.js](https://highlightjs.org/) for code blocks
- **Uploads**: [Multer](https://github.com/expressjs/multer) (Configured for up to 10MB images)

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your machine.
- Local environment (.env) configured.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/duckterkru29/tncp.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Access the site:
   - Frontend: `http://localhost:3000`
   - Admin Login: `http://localhost:3000/login`

## ⚙️ Configuration (.env)

Ensure you have a `.env` file in the root directory:
```env
ADMIN_USER=your_username
ADMIN_PASS=your_secure_password
SESSION_SECRET=your_random_secret
PORT=3000
```

## 📂 Project Structure

- `public/`: Master frontend files & public assets.
- `server.js`: Core Express server & API routes.
- `data/`: JSON database files.
- `uploads/`: Project & article images.

---
Developed by **Teguh Nuraji Condro Pranoto (TNCP)**. All Rights Reserved.
