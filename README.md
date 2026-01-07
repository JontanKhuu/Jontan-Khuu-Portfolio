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
├── README.md           # This file
└── STORAGE.md          # Storage system documentation
```
## Deployment

### Environment Variables

Before deploying, you need to set up the following environment variables. Create a `.env.local` file (or set them in your hosting platform):

**Required:**
- `JWT_SECRET` - Generate a secure secret: `openssl rand -base64 32`
- `ADMIN_PASSWORD_HASH` - Generate using: `node scripts/generate-password-hash.js`
- `SMTP_HOST` - Your SMTP server hostname
- `SMTP_PORT` - SMTP port (587 for TLS, 465 for SSL)
- `SMTP_USER` - Your SMTP username/email
- `SMTP_PASSWORD` - Your SMTP password
- `CONTACT_EMAIL` - Email to receive contact form submissions

**Optional:**
- `JWT_EXPIRATION_TIME` - Token expiration (default: 24h)
- `STORAGE_TYPE` - Storage type: 'local' (default) or cloud provider
- `NEXT_PUBLIC_SITE_URL` - Your site URL for SEO (e.g., https://yourdomain.com)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID (if using analytics)

See `.env.example` for a complete template (create this file if it doesn't exist).

### Production Checklist

- [ ] Set all required environment variables
- [ ] Generate secure `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Set `ADMIN_PASSWORD_HASH` (use `scripts/generate-password-hash.js`)
- [ ] Configure SMTP settings for contact form
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your actual domain
- [ ] Update `robots.txt` and `sitemap.ts` with your domain
- [ ] Update metadata in `app/layout.tsx` with your information
- [ ] Verify all tests pass (`npm test -- --run`)
- [ ] Build successfully (`npm run build`)
- [ ] Test the production build locally (`npm start`)
- [ ] Set up cloud storage (if not using local storage)
- [ ] Configure custom domain and SSL certificate
- [ ] Set up monitoring/analytics (optional)

### Deployment Platforms

**Vercel (Recommended for Next.js):**
- Automatic deployments from GitHub
- Environment variables in dashboard
- Built-in analytics and monitoring

**Other Platforms:**
- Ensure Node.js 20+ is available
- Set environment variables in platform dashboard
- Build command: `npm run build`
- Start command: `npm start`

### Health Check

The application includes a health check endpoint at `/api/health` that returns:
- Status: "healthy"
- Timestamp
- Uptime
- Environment

This can be used for monitoring and load balancer health checks.

## License

This project is licensed under the MIT License.

