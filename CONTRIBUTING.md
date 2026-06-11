# 🤝 Contributing to SmartScan

First off — thank you for considering contributing to SmartScan! Every contribution, no matter how small, is greatly appreciated.

This document outlines the guidelines for contributing to the project. Following these ensures a smooth, respectful collaboration for everyone.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Development Setup](#-development-setup)
- [Branching Strategy](#-branching-strategy)
- [Commit Message Convention](#-commit-message-convention)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Reporting Bugs](#-reporting-bugs)
- [Requesting Features](#-requesting-features)

---

## 📜 Code of Conduct

By participating in this project, you agree to uphold our community standards:

- **Be respectful** — treat everyone with kindness and professionalism
- **Be constructive** — provide helpful, actionable feedback
- **Be inclusive** — welcome contributors of all skill levels
- **Be patient** — maintainers are often busy; allow time for responses

Harassment, discrimination, or disrespectful behavior of any kind will result in permanent exclusion from the project.

---

## 💡 How Can I Contribute?

### 🐛 Bug Reports
Found a bug? [Open a GitHub Issue](../../issues/new?template=bug_report.md) with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Python version, CUDA version, etc.)
- Relevant error logs or screenshots

### ✨ Feature Requests
Have an idea? [Open a Feature Request](../../issues/new?template=feature_request.md) with:
- A clear use case describing why this feature would be useful
- Any relevant references, papers, or implementations
- Whether you are willing to implement it yourself

### 🔧 Code Contributions
- Bug fixes
- Performance improvements (especially for Pi 5 inference speed)
- New ML model integrations
- Frontend UI improvements
- Documentation improvements
- Hardware firmware improvements

### 📖 Documentation
- Fix typos or unclear explanations
- Translate docs to other languages
- Add examples or tutorials

---

## 🛠️ Development Setup

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork:
git clone https://github.com/YOUR_USERNAME/SmartScan.git
cd SmartScan

# Add the upstream remote
git remote add upstream https://github.com/Atik203/SmartScan---Automated-Book-Digitizer---LaTeX-Extractor.git
```

### 2. Backend (Python / Flask)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Fill in your API keys in .env
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_FLASK_URL=http://localhost:5000" > .env.local
npm run dev
```

### 4. Start Development Servers

```bash
# Terminal 1 — Flask backend
cd backend && python app.py

# Terminal 2 — Next.js frontend
cd frontend && npm run dev
```

---

## 🌿 Branching Strategy

We use a simplified **Git Flow**:

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `develop` | Integration branch for new features |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation updates |
| `chore/<name>` | Maintenance, refactoring |

**Always branch from `develop`:**

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/my-awesome-feature
```

---

## 📝 Commit Message Convention

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Code formatting (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD pipeline changes |

### Scopes

| Scope | Description |
|-------|-------------|
| `backend` | Flask API / Python backend |
| `frontend` | Next.js dashboard |
| `arduino` | Arduino firmware |
| `pi` | Raspberry Pi bridge scripts |
| `ml` | Machine learning models / training |
| `docs` | Documentation files |

### Examples

```bash
# Good commit messages:
feat(backend): add Gemini API fallback for math-heavy pages
fix(arduino): correct flipper servo timing in automation cycle
docs(readme): add Raspberry Pi 5 deployment instructions
perf(ml): optimize TrOCR batch inference for Pi 5 CPU
chore(frontend): upgrade Next.js from 15 to 16
```

---

## 🔄 Pull Request Process

1. **Keep PRs focused** — one feature/fix per PR; avoid mixing unrelated changes
2. **Update documentation** — if you add/change APIs or features, update `README.md`
3. **Add/update tests** — include tests for new functionality where applicable
4. **Ensure CI passes** — all checks must be green before review
5. **Fill in the PR template** — provide a clear description and link related issues

### PR Checklist

Before submitting, confirm:

- [ ] Code follows the [coding standards](#-coding-standards)
- [ ] All existing tests pass (`npm run lint` for frontend, `python -m pytest` for backend)
- [ ] New tests added for new features
- [ ] Documentation updated if needed
- [ ] Commit messages follow the convention
- [ ] Branch is rebased on latest `develop`
- [ ] No hardcoded credentials or API keys
- [ ] `.env` files are NOT committed

### Review Process

- A maintainer will review your PR within 3–5 business days
- Address all review comments in new commits (don't force-push)
- Once approved, a maintainer will merge it

---

## 🎨 Coding Standards

### Python (Backend)

- **Formatter:** [`black`](https://black.readthedocs.io/) — run `black .` before committing
- **Linter:** [`ruff`](https://github.com/astral-sh/ruff) — run `ruff check .`
- **Type hints:** Use type annotations for all function signatures
- **Docstrings:** Google-style docstrings for all public functions and classes
- **Line length:** 100 characters max

```python
# Good example:
def route_page(
    dewarped_path: str,
    detected_boxes: list[dict],
    extract_folder: str,
    page_number: int,
    source_file: str,
) -> dict:
    """Route a processed page through the appropriate AI pipeline.

    Args:
        dewarped_path: Absolute path to the whiteness-normalized image.
        detected_boxes: List of YOLO bounding box dicts from detection step.
        extract_folder: Directory containing cropped math expression images.
        page_number: Sequential page number for the output markdown file.
        source_file: Original filename for activity logging.

    Returns:
        A dict with keys: route, markdown, latex_blocks, latency_ms.
    """
```

### TypeScript / React (Frontend)

- **Formatter:** Prettier (configured via `.prettierrc`)
- **Linter:** ESLint (`npm run lint`)
- **Types:** Prefer TypeScript interfaces over `any`
- **Components:** Functional components only; use React hooks
- **Naming:** PascalCase for components, camelCase for functions/variables

### Arduino (C++)

- **Comments:** Comment every function and non-obvious logic block
- **Constants:** Use `#define` or `const int` — no magic numbers
- **Naming:** `camelCase` for variables, `UPPER_SNAKE_CASE` for constants

---

## 🧪 Testing Guidelines

### Backend Tests

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=html

# Test a specific module
python -m pytest tests/test_traffic_controller.py -v
```

### Frontend Tests

```bash
cd frontend

# Lint check
npm run lint

# Type check
npx tsc --noEmit

# Build check (catches all TypeScript errors)
npm run build
```

### Manual Testing Checklist

When contributing to the processing pipeline, verify:
- [ ] `/process-page` endpoint returns correct JSON structure
- [ ] Math detection visualizes bounding boxes correctly
- [ ] TrOCR produces valid LaTeX output
- [ ] Tesseract handles both plain text and mixed pages
- [ ] PDF compilation succeeds with Pandoc
- [ ] Frontend dashboard reflects real-time API data

---

## 🐛 Reporting Bugs

Please use the **GitHub Issues** page and include:

```
**Environment:**
- OS: [e.g., Windows 11, Raspberry Pi OS Bookworm]
- Python version: [e.g., 3.11.4]
- PyTorch version: [e.g., 2.1.0+cu121]
- CUDA version (if applicable): [e.g., 12.1]
- Node.js version: [e.g., 20.10.0]

**To Reproduce:**
1. Go to '...'
2. Run command '...'
3. Observe error '...'

**Expected behavior:**
[Clear description of what should happen]

**Actual behavior:**
[What actually happens, including full error trace]

**Additional context:**
[Screenshots, logs, relevant config]
```

---

## 🚀 Requesting Features

Use the **GitHub Issues** page with the `enhancement` label and describe:

1. **The problem** — What pain point does this solve?
2. **Proposed solution** — How would you implement it?
3. **Alternatives considered** — What else did you think about?
4. **Impact** — Who benefits and how?

High-priority feature areas:
- 🎯 Improved math detection accuracy (new model architectures)
- ⚡ Faster TrOCR inference on CPU/ARM
- 🌍 Multi-language OCR support (Arabic, Chinese, etc.)
- 📱 Mobile-responsive frontend
- 🔄 Batch job queuing with Redis/Celery

---

## 📞 Contact

- **GitHub Issues:** For bugs and feature requests
- **Discussions:** For general questions and ideas
- **Email:** For security issues only — see [SECURITY.md](SECURITY.md)

---

<div align="center">

Thank you for making SmartScan better! 🎉

</div>
