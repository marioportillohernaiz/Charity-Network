<img width="1063" height="184" alt="Screenshot 2025-11-07 214947" src="https://github.com/user-attachments/assets/9287328e-1ad5-4ea7-9147-9c6ec635f59b" />

> *Enhancing Resource Management Between Charities*

[![Framework: Next.js](https://img.shields.io/badge/Built%20with-Next.js-black.svg)](https://nextjs.org/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-green.svg)](https://supabase.io/)
[![Deployed on: Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-lightgrey.svg)](https://vercel.com)
[![AI Integration: OpenAI](https://img.shields.io/badge/AI-OpenAI-orange.svg)](https://openai.com/)

Charity Network is a web platform designed to empower collaboration between charities by enabling them to **discover**, **share resources**, and **communicate efficiently**.  
The project addresses a major gap in the non-profit sector - the lack of infrastructure for inter-charity collaboration and resource optimisation.

🌍 **Live Deployment:** [https://charitynetwork.vercel.app](https://charitynetwork.vercel.app)

---

## 📖 Table of Contents
1. [Overview](#overview)  
2. [Features](#features)  
3. [System Architecture](#system-architecture)  
4. [Tools & Frameworks](#tools--frameworks)  
5. [Project Structure](#project-structure)  
6. [Testing](#testing)  
7. [Deployment](#deployment)  
9. [How to Run Locally](#how-to-run-locally)  

---

## 🧩 Overview

Charity Network bridges the communication gap between charities by providing a **centralised digital platform** for resource discovery, sharing, and collaboration.  
It uses **AI-driven recommendations** and an **interactive map-based interface** to improve efficiency, reduce donation waste, and strengthen community impact.

### 🎯 Objectives
- Enable location-based charity discovery.
- Simplify resource management and sharing.
- Provide AI-powered insights for resource demand.
- Facilitate transparent communication across the sector.

---

## 🚀 Features

- 🗺️ **Interactive Map Interface** – Discover nearby charities via a Leaflet.js map.  
- 📦 **Resource Management System** – Add, request, and track resources across charities.  
- 🤖 **AI Recommendations** – OpenAI integration for seasonal predictions and smart matching.  
- 💬 **Chatbot Assistant** – AI chatbot guides users through resource sharing workflows.  
- 🔒 **Secure Authentication** – Supabase Auth with row-level security and JWT token handling.  
- 📱 **Responsive Design** – Optimised for mobile and desktop with Tailwind CSS.  
- 📊 **Analytics Dashboard** – Visualise stock and sales trends with Recharts.  
- 🔔 **Real-Time Notifications** – Toast alerts for resource requests and updates.  

---

## 🧠 System Architecture

Charity Network is built using a **modern, scalable web architecture** that integrates cloud services and AI APIs.

**Tech Stack Overview:**
```
Frontend: Next.js (React + TypeScript)
Backend: Supabase (PostgreSQL + Auth)
AI Layer: OpenAI API (Recommendations, Chatbot)
Mapping: Leaflet.js
Hosting: Vercel
```

**Data Flow Diagram**
```
User → Next.js Client → Supabase Backend → OpenAI API → Response → UI
```

---

## ⚙️ Tools & Frameworks

**Development Environment**
- Visual Studio Code  
- Git & GitHub (Kanban workflow for version control and planning)

**Languages & Frameworks**
- TypeScript  
- Next.js  
- Tailwind CSS  
- Supabase  

**Libraries & APIs**
- Shadcn UI (Component library)  
- Leaflet.js (Map interface)  
- Recharts (Analytics visualisation)  
- Lucide React (Icons)  
- Sonner (Notification system)  
- OpenAI API (AI-powered recommendations)  

---

## 🧱 Project Structure
```bash
charity-network  
├─ _tests_  
├─ app  
│   ├─ (auth)  
│   ├─ api  
│   ├─ protected  
│   │   ├─ MapPage.tsx  
│   │   └─ …  
│   ├─ HomePage.tsx  
│   └─ layout.tsx  
├─ components  
│   ├─ ui-components  
│   └─ personalised-components  
├─ public  
└─ …
```

---

## 🧪 Testing

**Testing Methodologies**
- 🧩 **Unit Testing:** Jest for validating React components and data logic.  
- 🔐 **Security Testing:** Verification of authentication and Supabase Row-Level Security.  
- 👥 **User Acceptance Testing (UAT):** Conducted with charity representatives and students.  
- 🧭 **UI Testing:** Evaluated usability and accessibility compliance (WCAG 2.1 AA).  

**Key Results**
- ✅ 100% pass rate across all Jest unit tests.  
- 🔒 Security policies successfully prevented unauthorised data access.  
- 🌟 UAT confirmed intuitive design and high usability scores.  

---

## ☁️ Deployment

**Hosting:** [Vercel](https://vercel.com/)  
**Database & Auth:** [Supabase](https://supabase.io)  
**AI Integration:** [OpenAI API](https://openai.com/api)  

---

## 🧑‍💻 How to Run Locally
```bash
# Clone the repository
git clone https://github.com/<your-username>/charity-network.git

# Navigate into the project directory
cd charity-network

# Install dependencies
npm install

# Add environment variables (.env.local)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - OPENAI_API_KEY

# Run the development server
npm run dev

# Open in your browser
http://localhost:3000
```

---

> *Developed by Mario Portillo Hernaiz – 2025*  
