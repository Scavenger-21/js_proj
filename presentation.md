# APIForge - Project Presentation

## 1. What is the Project?
**APIForge** is a full-stack platform built for developers, similar to tools like Postman or Insomnia. It allows you to build and test API requests, but it goes a step further by offering built-in analytics, security checks, and automatic diagnostics for failed requests.

---

## 2. The Architecture & Tech Stack
It's built as a **Monorepo**, meaning the frontend and backend live in the same codebase and share the same TypeScript types.

* **Frontend (The UI):** Built with **Next.js** (React). It uses **Tailwind CSS** for a premium design, **Framer Motion** for smooth animations, and **Zustand** to manage the state.
* **Backend (The Server):** Built with **Fastify** (a very fast Node.js framework). It uses **Zod** to validate that any incoming data is correct before processing it.
* **Database:** It uses a local **SQLite** database managed via **Prisma** (an ORM that makes database operations easy).

---

## 3. The Major Logics & Workflows

### The Request Builder & Proxy Engine
* **How it works:** You use the UI to build an API request. When you click "Send," the frontend sends it to our backend **Proxy Engine**. The backend safely makes the request to the outside internet and returns the result.
* **The Logic:** This acts as a security measure to prevent attacks like SSRF (where hackers try to access internal network files through the app).

### The Diagnostics Engine
* **How it works:** If you send a request and it fails (e.g., a 404 or 500 error), this engine automatically kicks in.
* **The Logic:** It analyzes the broken response using a rule engine, figures out the most likely root cause of the crash, and gives you a prioritized list of actionable fixes.

### Security Posture Analysis
* **How it works:** Every time a request is made, the app scans both the request and the response.
* **The Logic:** It automatically checks for security vulnerabilities—like using insecure `http://` instead of `https://`, leaking sensitive tokens in URLs, or missing important security headers.

### Analytics & Health Monitor
* **How it works:** Every request you make is saved into the SQLite database.
* **The Logic:** The system uses this historical data to calculate a "health score" for the endpoints. It provides a real-time dashboard showing your success vs. failure ratios, request volumes, and how fast the APIs are responding over time.

---

## Summary
*APIForge is a Next.js and Fastify monorepo that lets you test APIs like Postman, but automatically runs security scans and diagnostic checks on your traffic, storing the history in SQLite to give you a real-time analytics dashboard of your API's health.*
