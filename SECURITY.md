# 🔐 Security Policy

## Supported Versions

We take security seriously. The following versions of Attentra receive security updates:

| Version | Supported |
|---|---|
| Latest (`master`) | ✅ Active support |
| Previous releases | ❌ No support |

We always recommend running the **latest version** from the `master` branch.

---

## 🚨 Reporting a Vulnerability

> **⚠️ Do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Attentra, please report it responsibly:

### How to Report

1. **Email**: Send a detailed report to **thakurcodeshere@gmail.com**
2. **Subject line**: `[SECURITY] Attentra — Brief description`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if you have one)

### What to Expect

| Timeline | Action |
|---|---|
| **Within 24 hours** | Acknowledgment of your report |
| **Within 72 hours** | Initial assessment and severity rating |
| **Within 7 days** | Action plan communicated to you |
| **Within 30 days** | Fix developed, tested, and deployed |

### After the Fix

- You will be credited in the release notes (unless you prefer anonymity)
- A security advisory will be published on GitHub
- The fix will be deployed to production immediately

---

## 🛡️ Security Measures

Attentra implements the following security practices:

### Anti-Fraud Engine
- **Keystroke Dynamics Analysis** — Detects automated/bot input patterns
- **Tab Focus Monitoring** — Flags attention bypass when users switch tabs
- **Speed-Running Detection** — Auto-rejects suspiciously fast submissions
- **Copy-Paste Interception** — Identifies programmatic text injection

### Application Security
- **Content Security Policy** — Strict CSP headers via Vercel
- **HTTPS Only** — All traffic encrypted via TLS
- **No Sensitive Data in Client** — API keys in mock data are demo-only
- **ESLint Security Rules** — Code quality enforcement on every PR

### CI/CD Pipeline
- **Automated Linting** — Every push and PR is linted via GitHub Actions
- **Build Verification** — Production bundle is validated before deployment
- **Dependency Auditing** — `npm audit` runs during CI

---

## 📋 Security Best Practices for Contributors

When contributing to Attentra, please follow these security guidelines:

1. **Never commit secrets** — API keys, tokens, or passwords
2. **Validate all inputs** — Sanitize user-provided data
3. **Use `const`** — Prevent accidental reassignment
4. **Avoid `eval()`** — Never evaluate dynamic strings as code
5. **Keep dependencies updated** — Check for known vulnerabilities
6. **Follow the principle of least privilege** — Request minimal permissions

---

## 🔗 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

---

<div align="center">

**Security is everyone's responsibility. Thank you for helping keep Attentra safe. 🔒**

</div>
