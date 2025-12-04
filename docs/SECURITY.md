# Security Best Practices

## Overview

Security is a top priority for ScaleFlow. This document outlines security best practices, potential vulnerabilities, and how to handle security issues.

## Reporting Security Vulnerabilities

**Do not publicly disclose security vulnerabilities!**

If you discover a security vulnerability, please report it privately:

1. Go to the [Security Advisories](https://github.com/Rafaelraas/ScaleFlow/security/advisories/new) page
2. Click "Report a vulnerability"
3. Provide detailed information about the vulnerability
4. We will respond within 48 hours

### What to Include in a Report

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information

## Authentication & Authorization

### Current Implementation

#### Supabase Authentication

ScaleFlow uses Supabase Auth for secure authentication:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Session management
const { data: { session } } = await supabase.auth.getSession();

// Logout
await supabase.auth.signOut();
```

**Security Features:**
- ✅ JWT-based authentication
- ✅ Secure password hashing (bcrypt)
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Session management with automatic refresh

#### Row-Level Security (RLS)

All database tables use RLS policies to enforce access control:

```sql
-- Example: Users can only view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Example: Managers can view company employees
CREATE POLICY "managers_view_company_profiles" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() AND role_name = 'manager'
    )
  );
```

**Benefits:**
- Database-level access control
- Cannot be bypassed from client
- Automatic enforcement on all queries

### Best Practices

#### Password Security

```typescript
// ✅ Good - Let Supabase handle password hashing
const { error } = await supabase.auth.signUp({
  email: email,
  password: password,
});

// ❌ Bad - Never store plain text passwords
// ❌ Bad - Never implement your own password hashing
```

**Password Requirements (implement in validation):**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

```typescript
// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
```

#### Session Management

```typescript
// Check session before protected operations
const checkSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Redirect to login
    navigate('/login');
    return false;
  }
  
  return true;
};

// Automatic token refresh is handled by Supabase
// But you can manually refresh if needed
const { data, error } = await supabase.auth.refreshSession();
```

#### Role-Based Access Control

```typescript
// Check user role before rendering protected features
const { userRole } = useSession();

if (userRole !== 'manager') {
  return <div>Access Denied</div>;
}

// Or use ProtectedRoute component
<Route element={<ProtectedRoute allowedRoles={['manager']} />}>
  <Route path="/schedules" element={<Schedules />} />
</Route>
```

## Input Validation & Sanitization

### Client-Side Validation

Always validate user input using Zod schemas:

```typescript
import * as z from 'zod';

// Define schema
const shiftSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  start_time: z.date(),
  end_time: z.date(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
}).refine((data) => data.end_time > data.start_time, {
  message: 'End time must be after start time',
  path: ['end_time'],
});
```

### XSS Prevention

React automatically escapes content, but be careful with:

```typescript
// ✅ Safe - React escapes by default
<div>{userInput}</div>

// ⚠️ Dangerous - Bypasses React escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe - Use a sanitization library if you must use HTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

**Vulnerable Patterns to Avoid:**

```typescript
// ❌ Bad - Can execute JavaScript
<div dangerouslySetInnerHTML={{ __html: comment }} />

// ❌ Bad - URL can be javascript: protocol
<a href={userProvidedUrl}>Click here</a>

// ✅ Good - Validate URLs
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

{isValidUrl(url) && <a href={url}>Click here</a>}
```

### SQL Injection Prevention

Supabase client automatically parameterizes queries:

```typescript
// ✅ Safe - Parameters are automatically escaped
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', userEmail); // Automatically escaped

// ❌ Bad - Never build SQL strings manually
// (Not possible with Supabase client, but shown as example)
const query = `SELECT * FROM profiles WHERE email = '${userEmail}'`;
```

## Environment Variables & Secrets

### Proper Secret Management

```bash
# .env file (never commit!)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# ✅ Good - Public keys only
# VITE_* prefix means variable is exposed to client
# Only use this for non-sensitive data

# ❌ Bad - Never commit these
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DATABASE_PASSWORD=secret123
API_SECRET=xxx
```

### Checking for Exposed Secrets

```bash
# Use git-secrets or similar tools
npm install -g git-secrets

git secrets --scan
git secrets --scan-history
```

### Environment-Specific Configuration

```typescript
// Use environment-specific values
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

if (isDevelopment) {
  console.log('Debug info:', data);
}

// Never expose sensitive data in client code
// ❌ Bad
const apiSecret = import.meta.env.VITE_API_SECRET;

// ✅ Good - Sensitive operations on server
// Use Supabase Edge Functions or backend API
```

## CSRF Protection

### Current Protection

Supabase handles CSRF protection automatically:
- SameSite cookies
- Token-based authentication
- Origin validation

### Additional Measures

```typescript
// For critical operations, add additional verification
const confirmDeletion = async (id: string) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this item?'
  );
  
  if (!confirmed) return;
  
  // Proceed with deletion
  await deleteItem(id);
};
```

## CORS Configuration

### Supabase CORS

Configure allowed origins in Supabase dashboard:

1. Go to Project Settings → API
2. Add allowed origins to CORS whitelist
3. Use specific domains, not wildcards in production

```typescript
// Development
ALLOWED_ORIGINS: http://localhost:5173

// Production
ALLOWED_ORIGINS: https://scaleflow.example.com
```

## Data Encryption

### Encryption at Rest

- ✅ Supabase encrypts all data at rest
- ✅ Automatic backups are encrypted
- ✅ Database connections use SSL/TLS

### Encryption in Transit

- ✅ All API calls use HTTPS
- ✅ WebSocket connections use WSS
- ✅ Enforce HTTPS in production

### Sensitive Data Handling

```typescript
// ❌ Bad - Logging sensitive data
console.log('User password:', password);
console.log('Credit card:', creditCard);

// ✅ Good - Redact or omit sensitive data
console.log('Processing payment for user:', userId);

// If you must log, redact sensitive parts
const redactEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return `${name.substring(0, 2)}***@${domain}`;
};
```

## Rate Limiting

### Current Limits

Supabase provides default rate limits:
- Anonymous requests: ~100 requests/second
- Authenticated: Higher based on plan

### Future Implementation

```typescript
// Client-side throttling
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('name', `%${query}%`);
  
  return data;
}, 500); // Wait 500ms after last keystroke
```

## File Upload Security

### Secure File Uploads (Future Implementation)

```typescript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const validateFile = (file: File) => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Check file size (e.g., 5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  return true;
};

// Upload with validation
const uploadAvatar = async (file: File) => {
  validateFile(file);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
    });
  
  if (error) throw error;
};
```

## Security Headers

### Recommended Headers (for deployment)

```nginx
# nginx configuration example
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Vercel Configuration

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force
```

### Automated Scanning

Enable Dependabot in GitHub:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Package Verification

```bash
# Verify package integrity
npm install --package-lock-only
npm audit signatures
```

## Logging & Monitoring

### Security Event Logging

```typescript
// Log security-relevant events
const logSecurityEvent = async (event: string, details: any) => {
  console.info(`[SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    userId: details.userId,
    ip: details.ip,
    // Don't log sensitive data
  });
  
  // In production, send to logging service
  // await sendToLoggingService(event, details);
};

// Example usage
await logSecurityEvent('login_success', { userId: user.id });
await logSecurityEvent('permission_denied', { 
  userId: user.id,
  resource: 'employees',
  action: 'delete'
});
```

### Error Handling

```typescript
// ✅ Good - Generic error messages to users
showError('An error occurred. Please try again.');

// ✅ Good - Detailed logging for developers
console.error('Database error:', {
  error: error.message,
  code: error.code,
  userId: user?.id,
  timestamp: new Date().toISOString(),
});

// ❌ Bad - Exposing internal details to users
showError(`Database error: ${error.message}`);
```

## Common Vulnerabilities & Mitigations

### 1. Broken Authentication

**Mitigation:**
- ✅ Use Supabase Auth (industry-standard)
- ✅ Enforce strong passwords
- ✅ Implement session timeout
- ⚠️ Add MFA (future enhancement)

### 2. Sensitive Data Exposure

**Mitigation:**
- ✅ Use HTTPS everywhere
- ✅ Never log sensitive data
- ✅ Redact data in error messages
- ✅ Use RLS for data access control

### 3. Broken Access Control

**Mitigation:**
- ✅ RLS policies on all tables
- ✅ Role-based access control
- ✅ Protected routes in frontend
- ✅ Verify permissions before operations

### 4. Security Misconfiguration

**Mitigation:**
- ✅ Environment-specific configs
- ✅ Security headers configured
- ✅ Error messages don't expose internals
- ✅ Default credentials changed

### 5. Cross-Site Scripting (XSS)

**Mitigation:**
- ✅ React escapes by default
- ✅ Validate and sanitize inputs
- ⚠️ Avoid `dangerouslySetInnerHTML`
- ✅ Content Security Policy headers

### 6. Insecure Deserialization

**Mitigation:**
- ✅ Validate data before processing
- ✅ Use type-safe parsing (Zod)
- ✅ Don't eval() user input
- ✅ Validate JSON structure

### 7. Insufficient Logging

**Mitigation:**
- ⚠️ Implement audit logging
- ⚠️ Monitor security events
- ⚠️ Set up alerts for suspicious activity
- ⚠️ Regular security reviews

## Security Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] RLS policies tested
- [ ] No secrets in code
- [ ] Dependencies updated
- [ ] npm audit shows no vulnerabilities
- [ ] Error messages don't expose internals
- [ ] Rate limiting considered
- [ ] Backup strategy in place
- [ ] Incident response plan documented

### Regular Maintenance

- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Review access logs
- [ ] Update documentation
- [ ] Review and rotate API keys

## Resources

### Security Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Snyk](https://snyk.io/) - Dependency scanning
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent secret commits
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Vulnerability scanning

### Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Web Security Academy](https://portswigger.net/web-security)

## Conclusion

Security is an ongoing process, not a one-time task. Stay informed about new vulnerabilities, keep dependencies updated, and always think about security implications when adding new features.

If you have questions about security practices, please reach out to the maintainers before implementing security-sensitive features.
