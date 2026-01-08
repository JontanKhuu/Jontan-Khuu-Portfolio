# Portfolio Website

A modern, interactive portfolio website designed to showcase my projects, skills, and professional experience. The site features a unique Windows Explorer-inspired interface that provides an engaging and intuitive user experience.

## Purpose

This portfolio website serves as a comprehensive showcase of my work, skills, and background. It provides visitors with an interactive way to explore my projects, learn about my technical expertise, and get in touch. The site includes an admin panel for easy content management, allowing me to update projects, skills, and other information without modifying code directly.

## Tech Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router for server-side rendering and routing
- **React 19.2.0** - UI library for building interactive components
- **TypeScript 5** - Type-safe JavaScript for better code quality and developer experience
- **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### Backend & API
- **Next.js API Routes** - Serverless API endpoints for data management
- **Node.js** - Runtime environment for server-side operations

### Authentication & Security
- **bcryptjs** - Password hashing for secure admin authentication
- **jsonwebtoken (JWT)** - Token-based authentication for admin sessions
- **Custom Security Middleware** - Rate limiting, input sanitization, and XSS protection

### Email & Communication
- **Nodemailer** - Email service for contact form submissions via SMTP

### Data Storage
- **JSON Files** - File-based storage for projects, skills, about, and resume data
- **Storage Abstraction Layer** - Flexible storage system supporting local filesystem (development) and cloud storage (production)
  - Local storage: Files stored in `storage/uploads/` and served from `public/uploads/`
  - Ready for cloud migration: Easy switch to S3, Cloudinary, etc. via environment configuration

### Development Tools
- **ESLint** - Code linting and quality assurance
- **TypeScript** - Static type checking
- **tsx** - TypeScript execution for scripts

## Project Structure

```
my-website/
├── app/
│   ├── admin/          # Admin panel pages and components
│   ├── api/            # API routes for data management
│   ├── components/     # React components (Board, ProjectCard, etc.)
│   ├── data/           # JSON data files (projects, skills, about, resume)
│   └── lib/            # Utility functions (auth, security, storage)
├── public/             # Static assets and uploaded images (served publicly)
├── storage/            # Storage directory for uploads (excluded from git)
├── scripts/            # Utility scripts (password generation, testing)
├── tests/              # Test files (Vitest)
├── README.md           # This file
├── STORAGE.md          # Storage system documentation
├── DEPLOYMENT.md       # Detailed deployment guide
├── DEPLOYMENT_CHECKLIST.md  # Pre-deployment checklist
├── EMAIL_SETUP.md      # Email configuration guide
└── ENV_SETUP.md        # Environment variables documentation
```


## License

This project is licensed under the MIT License.

