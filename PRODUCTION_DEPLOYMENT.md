# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### Environment Variables
Ensure all required environment variables are set in your production environment:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Twilio Configuration (Optional - for SMS reminders)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Security Configuration

1. **Firebase Security Rules**: Update your Firestore and Storage rules
2. **CORS Configuration**: Update the allowed origins in `src/lib/config/production.ts`
3. **Rate Limiting**: Configure rate limiting for your API routes
4. **HTTPS**: Ensure your domain uses HTTPS in production

### Database Setup

1. **Firestore Collections**: Ensure all required collections exist
2. **Indexes**: Create composite indexes for complex queries
3. **Backup Strategy**: Set up automated backups

## 🔧 Build and Deploy

### Local Build Test
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm start
```

### Production Build
```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Build for production
npm run build

# The build output will be in the .next directory
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=.next
```

#### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit sensitive data to version control
- Use environment-specific configuration files
- Rotate API keys regularly

### 2. Firebase Security
- Implement proper Firestore security rules
- Use Firebase Auth for user authentication
- Enable Firebase App Check for additional security

### 3. API Security
- Implement rate limiting on API routes
- Validate all user inputs
- Use HTTPS for all communications
- Implement proper CORS policies

### 4. Data Protection
- Sanitize all user inputs
- Implement proper error handling
- Log security events
- Regular security audits

## 📊 Monitoring and Analytics

### Error Tracking
- Set up Sentry or similar error tracking service
- Monitor application performance
- Set up alerts for critical errors

### Analytics
- Implement Google Analytics or similar
- Track user behavior and app performance
- Monitor conversion rates

### Logging
- Set up centralized logging
- Monitor API usage and performance
- Track user authentication events

## 🚨 Performance Optimization

### 1. Code Splitting
- Implement dynamic imports for large components
- Use Next.js automatic code splitting
- Optimize bundle size

### 2. Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Optimize image formats and sizes

### 3. Caching
- Implement proper caching strategies
- Use CDN for static assets
- Cache API responses appropriately

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Post-Deployment Checklist

### 1. Functionality Testing
- [ ] User registration and login
- [ ] Appointment creation and management
- [ ] Client management
- [ ] Service configuration
- [ ] Profile management

### 2. Performance Testing
- [ ] Page load times
- [ ] API response times
- [ ] Database query performance
- [ ] Mobile responsiveness

### 3. Security Testing
- [ ] Authentication flows
- [ ] Authorization checks
- [ ] Input validation
- [ ] XSS protection
- [ ] CSRF protection

### 4. Monitoring Setup
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Security monitoring

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript compilation
   - Check for missing dependencies

2. **Runtime Errors**
   - Check Firebase configuration
   - Verify API endpoints
   - Check browser console for errors

3. **Performance Issues**
   - Optimize images and assets
   - Implement proper caching
   - Check database queries

4. **Security Issues**
   - Review security rules
   - Check authentication flows
   - Validate user inputs

## 📞 Support

For production support:
- Monitor application logs
- Set up alerting for critical issues
- Have a rollback strategy ready
- Document common issues and solutions

## 🔄 Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security patches
- Monitor performance metrics
- Backup data regularly
- Review error logs

### Security Updates
- Keep all dependencies updated
- Monitor security advisories
- Regular security audits
- Update Firebase security rules as needed 