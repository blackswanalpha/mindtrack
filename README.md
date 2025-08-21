# MindTrack - Mental Health Questionnaire Management Platform

A comprehensive mental health questionnaire management platform built with Next.js 15, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication System**: JWT-based authentication with secure login/register
- **Questionnaire Management**: Create, edit, and manage mental health questionnaires
- **Response Collection**: Collect and analyze questionnaire responses
- **QR Code Generation**: Generate QR codes for easy questionnaire access
- **AI Analysis**: AI-powered analysis of questionnaire responses
- **Organization Management**: Multi-organization support with role-based access
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Email Notifications**: Automated email notifications and templates

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT, bcryptjs
- **UI Components**: Radix UI, shadcn/ui
- **Validation**: Zod
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindtrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@host:5432/database_name?sslmode=require
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Initialize the database**
   ```bash
   # Start the development server first
   npm run dev

   # In another terminal, initialize the database
   curl -X POST http://localhost:3000/api/init-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.
