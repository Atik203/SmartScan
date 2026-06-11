# 🔒 Security Policy

## Overview

SmartScan takes security seriously. This document describes our security policy,
supported versions, how to report vulnerabilities, and best practices for
deploying SmartScan safely.

---

## 🗂️ Supported Versions

Security patches are backported to the following versions:

| Version | Supported | Notes |
|---------|-----------|-------|
| `main` branch | ✅ Active | Latest stable — always receives patches |
| `develop` branch | ✅ Active | Integration branch — receives patches before release |
| Older releases | ❌ Not supported | Please upgrade to `main` |

We strongly recommend always running the latest commit on `main`.

---

## 🚨 Reporting a Vulnerability

**Do NOT open a public GitHub Issue for security vulnerabilities.**

Instead, please report vulnerabilities via one of these private channels:

1. **GitHub Private Security Advisory** *(preferred)*  
   Go to: `Security` tab → `Advisories` → `New draft security advisory`

2. **Email** *(for critical issues)*  
   Send to the repository maintainer's email listed on their GitHub profile.  
   Subject line: `[SmartScan SECURITY] <brief description>`

### What to Include

Please provide as much detail as possible:

```
**Vulnerability Type:**
[e.g., API key exposure, path traversal, command injection, SSRF, etc.]

**Affected Component:**
[e.g., backend/app.py, frontend, Arduino firmware, Raspberry Pi scripts]

**Severity Assessment:**
[Critical / High / Medium / Low]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Potential Impact:**
[Describe what an attacker could achieve]

**Suggested Fix (if known):**
[Optional — any mitigation ideas]
```

### Response Timeline

| Phase | Timeline |
|-------|----------|
| Initial acknowledgement | Within 48 hours |
| Severity assessment | Within 5 business days |
| Fix development | 7–30 days (depending on severity) |
| Patch release + disclosure | After fix is confirmed |

---

## 🛡️ Security Best Practices for Deployment

### 🔑 API Keys & Secrets

> [!CAUTION]
> **NEVER** commit `.env` files or any file containing API keys to version control.

```bash
# ✅ Correct — use the example template
cp backend/.env.example backend/.env
# Edit .env with your values — it is gitignored automatically

# ❌ Wrong — never do this
git add backend/.env
```

**Keys to protect:**
- `GEMINI_API_KEY` — Google Gemini API (billed resource)
- `HF_TOKEN` — HuggingFace access token (if using private models)

**Key rotation schedule:**
- Rotate Gemini API keys every **90 days**
- Immediately rotate any key that may have been exposed

### 🌐 Network Security

**Flask API (Backend):**

By default, Flask binds to `0.0.0.0:5000` and is intended for use on a **trusted local network only** (e.g., your home lab or university lab).

```python
# backend/app.py — default configuration
app.run(host="0.0.0.0", port=5000)
```

> [!WARNING]
> **Do NOT expose port 5000 to the public internet without a reverse proxy and authentication.**

For production or public deployment:

1. **Use a reverse proxy** (Nginx or Caddy) with HTTPS/TLS
2. **Add authentication** (API key middleware or OAuth)
3. **Restrict CORS** — change `origins="*"` to your specific frontend domain:

```python
# backend/app.py
CORS(app, resources={r"/*": {"origins": "https://your-domain.com"}})
```

4. **Use a firewall** — block port 5000 externally; only allow via reverse proxy

**Next.js Frontend:**

- Run behind Vercel, Nginx, or another production host for public deployment
- Use `HTTPS` only in production
- Configure `Content-Security-Policy` headers

### 📁 File Upload Security

SmartScan accepts image uploads via `/process-page`. The following protections are in place:

- ✅ `werkzeug.utils.secure_filename()` sanitizes all uploaded filenames
- ✅ Files are saved to a dedicated `static/upload/` directory
- ✅ Uploaded files are only processed as images (OpenCV rejects invalid files)
- ⚠️ No MIME type validation beyond filename extension — planned improvement

**Recommended hardening:**

```python
# Restrict allowed extensions (add to backend/app.py):
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def _allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS
```

### 🔗 Serial Port & ADB Security

- **Arduino serial port** (`/dev/ttyUSB0` or `COM*`) — restrict OS-level permissions to your user account only
- **ADB connections** — only authorize trusted USB devices on the Raspberry Pi:
  ```bash
  # Review authorized ADB keys
  cat ~/.android/adb_keys
  
  # Revoke all and re-authorize if needed
  adb kill-server && rm ~/.android/adb_keys
  ```

### 🍓 Raspberry Pi Hardening

For university lab or shared environments:

```bash
# Change default Pi password immediately
passwd

# Disable password SSH — use key-based authentication only
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no

# Keep OS updated
sudo apt update && sudo apt upgrade -y

# Enable UFW firewall
sudo ufw allow ssh
sudo ufw allow 5000/tcp    # Only if needed externally
sudo ufw enable
```

### 🔐 Model Weights Security

Trained model files (`.pt`, HuggingFace directories) are stored in `models/` which is gitignored.

- ✅ Model weights are NOT committed to the repository
- ✅ Download scripts validate file sizes after download
- ⚠️ When downloading models from HuggingFace or third parties, verify checksums if provided

---

## 🔍 Known Security Considerations

| Issue | Severity | Status | Mitigation |
|-------|----------|--------|-----------|
| Flask CORS `origins="*"` | Medium | Open | Acceptable for local LAN use; restrict for public deployment |
| No file upload MIME validation | Low | Open | File parsed by OpenCV which rejects invalid images |
| Flask runs without TLS | Medium | Open | Designed for LAN use; add Nginx + certbot for public |
| ADB USB debugging enabled | Medium | Accepted | Required for camera capture; ensure physical security |
| Gemini API key in `.env` | Low | Mitigated | `.gitignore` prevents accidental commit |

---

## 📦 Dependency Security

We use pinned minimum versions in `requirements.txt` and `package.json`. 

**Regularly audit dependencies:**

```bash
# Python — check for known vulnerabilities
pip install pip-audit
pip-audit

# Node.js — check for vulnerabilities
npm audit

# Auto-fix low-severity issues
npm audit fix
```

GitHub Dependabot is enabled on this repository to automatically flag outdated or vulnerable dependencies.

---

## 🏛️ Disclosure Policy

We follow **Coordinated Vulnerability Disclosure (CVD)**:

1. Researcher reports privately
2. Maintainers confirm and assess severity
3. Maintainers develop and test a fix
4. Fix is released
5. CVE (if applicable) is requested
6. Public disclosure with credit to the reporter (unless anonymity is requested)

We do NOT have a bug bounty program at this time.

---

## 📋 Security Changelog

| Date | Issue | Severity | Resolution |
|------|-------|----------|-----------|
| 2026-06-11 | Initial security policy established | — | This document |

---

## 📞 Contact

For security issues only:  
→ Use GitHub Private Security Advisories (preferred)  
→ Or email the maintainer listed on their GitHub profile

For general bugs and questions, use [GitHub Issues](../../issues).

---

<div align="center">

Security is everyone's responsibility. Thank you for helping keep SmartScan safe. 🛡️

</div>
