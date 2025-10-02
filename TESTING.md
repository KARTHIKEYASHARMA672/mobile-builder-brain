# AI Study Buddy - Testing Guidelines

## Testing Strategy

This document outlines the testing approach for the AI Study Buddy application, covering manual testing, automated testing recommendations, and quality assurance procedures.

## Feature Compliance Checklist

### Core Features (PRD Phase 1-4)
- [x] **Question Upload System**
  - [x] Camera-based text recognition
  - [x] Manual text input
  - [x] Subject categorization
  - [x] Image storage

- [x] **AI Content Generation**
  - [x] 2-minute format
  - [x] 5-minute format
  - [x] 10-minute format
  - [x] Essay format
  - [x] Smart notes creation

- [x] **Interactive Quiz Generator**
  - [x] AI-powered quiz creation
  - [x] Multiple choice questions
  - [x] Timer functionality
  - [x] Progress tracking

- [x] **Study Progress Tracking**
  - [x] Personal dashboard
  - [x] Learning analytics
  - [x] Study streak counter

- [x] **Content Library**
  - [x] Personal repository
  - [x] Search functionality
  - [x] Filter by subject/type
  - [x] Sort options

- [x] **Offline Capabilities**
  - [x] PWA functionality
  - [x] Service worker
  - [x] IndexedDB storage
  - [x] Offline page

- [x] **Export Options**
  - [x] PDF generation
  - [x] Share functionality

- [x] **Favorites System**
  - [x] Bookmark questions
  - [x] Manage favorites

- [x] **Study Session Timer**
  - [x] Pomodoro timer
  - [x] Session tracking

### Screen Implementation (PRD Phase 2-4)
- [x] Login Screen
- [x] Sign Up Screen
- [x] Forgot Password Screen
- [x] Dashboard/Home Screen
- [x] Upload Question Screen
- [x] Generated Content Screen
- [x] Quiz Screen
- [x] Quiz Results Screen
- [x] Library Screen
- [x] Profile Screen
- [x] Settings Screen
- [x] Not Found Screen (404)

## Manual Testing Procedures

### Authentication Flow
```
Test Case: User Registration
1. Navigate to /auth
2. Click "Sign Up" tab
3. Enter valid email and password
4. Verify email confirmation sent
5. Check profile created in database
Expected: User successfully registered and redirected to dashboard
```

```
Test Case: User Login
1. Navigate to /auth
2. Enter valid credentials
3. Click "Sign In"
Expected: User authenticated and redirected to dashboard
```

```
Test Case: Password Reset
1. Click "Forgot Password"
2. Enter registered email
3. Check inbox for reset link
4. Follow link and set new password
Expected: Password successfully reset
```

### Question Upload Flow
```
Test Case: Camera Upload
1. Navigate to /upload
2. Click "Open Camera"
3. Grant camera permissions
4. Capture question image
5. Select subject
6. Click "Process Question"
Expected: Question uploaded and AI processing initiated
```

```
Test Case: Manual Input
1. Navigate to /upload
2. Enter question text manually
3. Select subject
4. Click "Process Question"
Expected: Question processed and content generated
```

### Content Generation Flow
```
Test Case: Multi-Format Generation
1. Upload a question
2. Wait for processing
3. Navigate to generated content
4. Switch between tabs (2M, 5M, 10M, Essay)
Expected: All formats display correctly with appropriate content
```

### Quiz Flow
```
Test Case: Complete Quiz
1. Navigate to quiz from content
2. Answer all questions
3. Submit quiz
4. View results
Expected: Correct score calculation and results display
```

### Library Management
```
Test Case: Search and Filter
1. Navigate to /library
2. Enter search term
3. Apply subject filter
4. Apply content type filter
Expected: Content filtered correctly
```

### Offline Functionality
```
Test Case: Offline Access
1. Load app while online
2. Disconnect internet
3. Navigate to library
4. View saved content
Expected: Cached content accessible offline
```

## Automated Testing Recommendations

### Unit Tests (Recommended: Vitest)

```typescript
// Example: hooks/useAI.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAI } from '@/hooks/useAI';

describe('useAI', () => {
  it('should generate content successfully', async () => {
    const { result } = renderHook(() => useAI());
    
    await waitFor(async () => {
      const response = await result.current.generateContent({
        question: 'Test question',
        contentType: '2M'
      });
      
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });
  });
});
```

### Integration Tests (Recommended: React Testing Library)

```typescript
// Example: pages/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import Dashboard from '@/pages/Dashboard';

describe('Dashboard', () => {
  it('should display user statistics', () => {
    render(<Dashboard />);
    
    expect(screen.getByText(/Questions Answered/i)).toBeInTheDocument();
    expect(screen.getByText(/Study Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Score/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Recommended: Playwright)

```typescript
// Example: e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up and log in', async ({ page }) => {
  await page.goto('/auth');
  
  // Sign up
  await page.click('text=Sign Up');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button:has-text("Sign Up")');
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

## Performance Testing

### Metrics to Monitor
- **First Contentful Paint (FCP)**: < 2s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Tools
- Lighthouse (Chrome DevTools)
- WebPageTest
- GTmetrix

### Performance Checklist
- [ ] Lighthouse score > 90
- [ ] All images optimized
- [ ] Bundle size < 500KB (initial)
- [ ] Code splitting implemented
- [ ] Service worker caching working

## Security Testing

### Security Checklist
- [ ] RLS policies prevent unauthorized access
- [ ] SQL injection protection verified
- [ ] XSS vulnerabilities checked
- [ ] CSRF protection implemented
- [ ] API keys not exposed
- [ ] HTTPS enforced
- [ ] Password policies enforced

### Tools
- Supabase Database Linter
- OWASP ZAP
- Browser security headers check

## Accessibility Testing

### WCAG 2.1 Compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast ratios pass (AA)
- [ ] Form labels present
- [ ] ARIA attributes correct
- [ ] Focus indicators visible

### Tools
- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet

### Responsive Design
- [ ] 320px - Mobile S
- [ ] 375px - Mobile M
- [ ] 425px - Mobile L
- [ ] 768px - Tablet
- [ ] 1024px - Laptop
- [ ] 1440px - Desktop

## Regression Testing

### After Each Update
1. Run full authentication flow
2. Test core user journeys
3. Verify data persistence
4. Check offline functionality
5. Validate PWA installation

### Automated Regression Suite
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Bug Tracking

### Bug Report Template
```
Title: [Brief description]

Environment:
- Browser: [Chrome 120]
- Device: [iPhone 14]
- OS: [iOS 17]

Steps to Reproduce:
1. Navigate to...
2. Click on...
3. Observe...

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Screenshots:
[Attach if applicable]

Severity: [Critical/High/Medium/Low]
```

## Quality Gates

### Before Merging to Main
- [ ] All tests pass
- [ ] Code review approved
- [ ] No console errors
- [ ] Performance metrics met
- [ ] Accessibility checks pass

### Before Production Deployment
- [ ] Staging environment tested
- [ ] Database migrations verified
- [ ] Edge functions deployed
- [ ] Secrets configured
- [ ] Monitoring enabled
- [ ] Rollback plan documented

## Continuous Testing

### Recommended CI/CD Pipeline
```yaml
# Example GitHub Actions workflow
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run build
```

## User Acceptance Testing (UAT)

### UAT Checklist
- [ ] All user stories from PRD verified
- [ ] Stakeholder sign-off obtained
- [ ] User feedback incorporated
- [ ] Edge cases handled
- [ ] Error messages clear and helpful

## Load Testing

### Scenarios to Test
1. Concurrent users (100+)
2. Large file uploads (5MB+)
3. Long-running AI requests
4. Database query performance
5. Edge function scalability

### Tools
- k6
- JMeter
- Artillery

## Test Data Management

### Test Accounts
```
Role: Student
Email: test.student@example.com
Password: [configured in test environment]

Role: Admin (future)
Email: test.admin@example.com
Password: [configured in test environment]
```

### Sample Data
- 50+ test questions across subjects
- 20+ generated content items
- 10+ completed quizzes
- Various quiz scores for analytics

## Documentation

### Keep Updated
- [ ] API documentation
- [ ] Component documentation
- [ ] User guides
- [ ] Developer onboarding
- [ ] Deployment procedures

## Next Steps for Testing Maturity

1. **Phase 1**: Manual testing (Current)
2. **Phase 2**: Add unit tests for hooks
3. **Phase 3**: Implement integration tests
4. **Phase 4**: Add E2E test coverage
5. **Phase 5**: Automate regression testing
6. **Phase 6**: Continuous testing in CI/CD
