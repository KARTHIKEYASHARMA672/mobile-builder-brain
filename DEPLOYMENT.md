# AI Study Buddy - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables & Secrets
Ensure all required secrets are configured in Supabase:
- ✅ `GEMINI_API_KEY` - For AI content generation
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_ANON_KEY` - Public anonymous key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key for edge functions

### 2. Security Configuration

#### Password Security (Manual Configuration Required)
⚠️ **IMPORTANT**: Enable password strength and leaked password protection in Supabase Dashboard:
1. Go to: Authentication → Settings → Password Security
2. Enable "Password Strength Requirements"
3. Enable "Leaked Password Protection"

#### Row Level Security (RLS)
All tables have RLS enabled with proper policies:
- ✅ `profiles` - Public read, user write own
- ✅ `questions` - User full access to own data
- ✅ `generated_content` - User access via questions
- ✅ `quizzes` - User full access to own quizzes
- ✅ `quiz_questions` - User access via quizzes
- ✅ `quiz_attempts` - User create and read own
- ✅ `favorites` - User full access to own favorites

### 3. Database Functions & Triggers
Verify these database functions are deployed:
- ✅ `search_questions()` - Full-text search for questions
- ✅ `get_user_stats()` - User statistics aggregation
- ✅ `handle_new_user()` - Auto-create profile on signup
- ✅ `update_updated_at_column()` - Auto-update timestamps

### 4. Storage Buckets
Ensure storage buckets are configured:
- ✅ `question-images` (Private) - User uploaded question images
- ✅ `avatars` (Public) - User profile avatars

### 5. Edge Functions
All edge functions are deployed:
- ✅ `generate-content` - AI content generation using Gemini
- ✅ `generate-quiz` - Quiz generation using Gemini
- ✅ `image-to-text` - OCR text extraction using Gemini Vision

### 6. PWA Configuration
- ✅ Service worker configured (`public/sw.js`)
- ✅ Manifest file configured (`public/manifest.json`)
- ✅ Offline page created (`public/offline.html`)
- ✅ Icons and splash screens (add to `public/` folder)

### 7. Performance Optimizations
- ✅ Code splitting implemented via React Router
- ✅ Lazy loading for images and components
- ✅ IndexedDB for offline storage
- ✅ Service worker caching strategies
- ✅ Production console logs removed

### 8. SEO & Meta Tags
Update `index.html` with:
- Page title and description
- Open Graph tags
- Twitter Card tags
- Canonical URL

## Deployment Steps

### Deploy to Lovable (Recommended)
1. Click "Publish" button in Lovable interface
2. Configure custom domain (optional)
3. Lovable automatically:
   - Builds and optimizes the app
   - Deploys edge functions
   - Configures CDN and SSL

### Manual Deployment (Alternative)

#### Build for Production
```bash
npm run build
```

#### Deploy Edge Functions
```bash
supabase functions deploy generate-content
supabase functions deploy generate-quiz
supabase functions deploy image-to-text
```

## Post-Deployment Verification

### 1. Test Core Features
- [ ] User registration and login
- [ ] Question upload (camera & manual)
- [ ] AI content generation (all formats)
- [ ] Quiz generation and taking
- [ ] Library search and filtering
- [ ] Profile management
- [ ] Offline functionality

### 2. Test PWA Installation
- [ ] Install prompt appears on mobile
- [ ] App installs successfully
- [ ] Offline mode works correctly
- [ ] Service worker updates properly

### 3. Performance Checks
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Largest Contentful Paint < 2.5s

### 4. Security Verification
- [ ] RLS policies working correctly
- [ ] No unauthorized data access
- [ ] Edge functions require authentication
- [ ] API keys not exposed in client

### 5. Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox
- [ ] Edge

## Monitoring & Analytics

### Set Up Error Tracking
Consider integrating error tracking service:
- Sentry
- LogRocket
- Bugsnag

### Monitor Performance
- Supabase Dashboard for database metrics
- Edge Function logs for API errors
- Browser DevTools for client-side issues

### User Analytics
- Track user engagement
- Monitor feature usage
- Analyze conversion funnels

## Maintenance

### Regular Updates
- Update dependencies monthly
- Review and optimize database queries
- Monitor storage usage
- Clean up old cached data

### Security Audits
- Run Supabase linter regularly
- Review RLS policies quarterly
- Update secrets if compromised
- Monitor for security vulnerabilities

## Troubleshooting

### Common Issues

**Issue**: Edge functions timing out
**Solution**: Optimize AI API calls, implement caching

**Issue**: Storage quota exceeded
**Solution**: Implement image compression, clean old files

**Issue**: Slow query performance
**Solution**: Add database indexes, optimize RLS policies

**Issue**: PWA not updating
**Solution**: Update service worker version, clear cache

## Support

For issues or questions:
- Check Lovable documentation: https://docs.lovable.dev
- Supabase documentation: https://supabase.com/docs
- Project repository issues

## Version History

- **v1.0.0** - Initial production release
  - Core features implemented
  - PWA functionality
  - AI integration complete
  - Security hardened
