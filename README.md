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
- **File System** - Image uploads stored in `public/uploads/` directory

### Development Tools
- **ESLint** - Code linting and quality assurance
- **TypeScript** - Static type checking
- **tsx** - TypeScript execution for scripts

## Key Features

- **Windows Explorer UI** - Unique file explorer interface for navigating portfolio content
- **Admin Panel** - Secure content management system for updating portfolio information
- **Project Showcase** - Display projects with images, descriptions, tags, and links
- **Skills Management** - Organized skills by category with project associations
- **Contact Form** - Secure contact form with spam protection and email notifications
- **Resume Display** - PDF/image resume viewing capability
- **Image Upload** - Admin panel for uploading and managing images
- **Responsive Design** - Mobile-friendly interface that works on all devices
- **Security Features** - Rate limiting, input validation, XSS protection, and honeypot spam filtering

## Project Structure

```
my-website/
├── app/
│   ├── admin/          # Admin panel pages and components
│   ├── api/            # API routes for data management
│   ├── components/     # React components (Board, ProjectCard, etc.)
│   ├── data/           # JSON data files (projects, skills, about, resume)
│   └── lib/            # Utility functions (auth, security)
├── public/             # Static assets and uploaded images
├── scripts/            # Utility scripts (password generation, testing)
└── README.md           # This file
```

## License

This project is licensed under the MIT License.

