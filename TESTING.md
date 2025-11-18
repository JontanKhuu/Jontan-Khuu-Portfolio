# Testing Guide

After building your portfolio, follow these steps to test everything before deployment.

## 1. Start Production Server

```bash
npm start
```

This will start the production server on `http://localhost:3000` (or the port shown in terminal).

## 2. Test Checklist

### ✅ Main Portfolio Features

- [ ] **Homepage loads correctly**
  - Visit `http://localhost:3000`
  - Cork board should display with all items

- [ ] **About Me section**
  - Click "About Me" item
  - Content panel should open
  - Profile image should display (if uploaded)
  - Text content should be readable

- [ ] **Skills section**
  - Click "Skills" folder
  - Skills should be displayed
  - Click on individual skills
  - Should show projects using that skill

- [ ] **Projects section**
  - Click "Projects" folder
  - All projects should be visible
  - Click on individual projects
  - Project details should display correctly
  - Links should work (if project has href)

- [ ] **Resume**
  - Click "Resume" item
  - Resume image should display (if uploaded)
  - Should be readable and properly sized

- [ ] **Social Links**
  - Click "GitHub" - should open in new tab
  - Click "LinkedIn" - should open in new tab
  - Links should go to correct URLs

### ✅ Contact Form

- [ ] **Form displays correctly**
  - Click "Contact Me" item
  - Form should open in content panel
  - All fields should be visible

- [ ] **Form validation**
  - Try submitting empty form → should show errors
  - Try invalid email → should show error
  - Try valid submission → should work

- [ ] **Email sending**
  - Fill out form with valid data
  - Submit form
  - Check your email inbox (the one set in `CONTACT_EMAIL` or `SMTP_USER`)
  - Email should arrive with correct content
  - HTML should be properly escaped (no XSS)

- [ ] **Rate limiting**
  - Submit form 13 times quickly
  - 14th submission should be rate limited
  - Should show "Too many submissions" error

### ✅ Admin Panel

- [ ] **Admin login**
  - Visit `http://localhost:3000/admin`
  - Should see login form
  - Enter correct password
  - Should authenticate successfully

- [ ] **Admin features**
  - Edit About Me content
  - Upload profile image
  - Edit Skills
  - Add/Edit/Delete Projects
  - Upload project images
  - Upload Resume
  - Changes should save correctly

- [ ] **Admin logout**
  - Click logout
  - Should redirect to homepage
  - Should require login again

### ✅ Security Tests

- [ ] **HTML injection**
  - Try submitting `<script>alert('XSS')</script>` in contact form
  - Email should show escaped HTML (not execute script)

- [ ] **Honeypot**
  - Open browser DevTools
  - Fill the hidden "website" field
  - Submit form
  - Should appear to succeed but no email sent

- [ ] **Rate limiting**
  - Make 13+ requests quickly
  - Should be blocked after limit

### ✅ Responsive Design

- [ ] **Mobile view**
  - Open browser DevTools (F12)
  - Toggle device toolbar (Ctrl+Shift+M)
  - Test on mobile sizes (iPhone, iPad, etc.)
  - All features should work
  - Text should be readable
  - Buttons should be clickable

- [ ] **Tablet view**
  - Test on tablet sizes
  - Layout should adapt properly

- [ ] **Desktop view**
  - Test on different screen sizes
  - Everything should look good

### ✅ Performance

- [ ] **Page load speed**
  - Open DevTools → Network tab
  - Reload page
  - Should load quickly (< 3 seconds)
  - Images should optimize

- [ ] **No console errors**
  - Open DevTools → Console tab
  - Should have no red errors
  - Warnings are usually okay

## 3. Quick Test Script

You can also run the automated security tests:

```bash
# In a separate terminal (keep npm start running)
npm run test:security
```

This will test:
- HTML/XSS injection protection
- Email header injection protection
- Honeypot field
- Input validation
- Rate limiting
- And more...

## 4. Common Issues & Solutions

### Contact form not sending emails
- Check `.env.local` has correct SMTP credentials
- Verify Gmail App Password is correct
- Check server console for error messages
- Make sure `CONTACT_EMAIL` is set (or defaults to `SMTP_USER`)

### Admin panel not working
- Check `ADMIN_PASSWORD_HASH` is set in environment
- Verify password hash is correct
- Check browser console for errors

### Images not loading
- Verify images are in `public/uploads/` directory
- Check file paths are correct
- Ensure images are uploaded via admin panel

### Build errors
- Run `npm run build` again
- Check for TypeScript errors
- Verify all dependencies are installed

## 5. Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Environment variables are ready for production
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Contact form works
- [ ] Admin panel works
- [ ] All content is up to date
- [ ] Images are optimized
- [ ] No sensitive data in code
- [ ] `.env.local` is in `.gitignore` (should be automatic)

## 6. After Deployment

Once deployed:

- [ ] Test on production URL
- [ ] Verify environment variables are set
- [ ] Test contact form on live site
- [ ] Test admin panel on live site
- [ ] Check email delivery
- [ ] Test on mobile devices
- [ ] Share with friends for feedback!

## Need Help?

If something doesn't work:
1. Check the browser console (F12)
2. Check the server terminal for errors
3. Verify environment variables are set
4. Make sure you restarted the server after changing `.env.local`

