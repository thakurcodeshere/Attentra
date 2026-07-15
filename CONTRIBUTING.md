# 🤝 Contributing to Attentra

First off — **thank you** for considering contributing to Attentra! 🎉

Every contribution makes this platform better for creators, developers, and reviewers worldwide. Whether you're fixing a typo, squashing a bug, or building an entirely new feature — you're making a real impact.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Development Setup](#-development-setup)
- [Project Architecture](#-project-architecture)
- [Coding Standards](#-coding-standards)
- [Commit Convention](#-commit-convention)
- [Pull Request Process](#-pull-request-process)
- [Issue Guidelines](#-issue-guidelines)
- [Community](#-community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Attentra Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to **thakurcodeshere@gmail.com**.

---

## 🌟 How Can I Contribute?

### 🐛 Report Bugs

Found something broken? [Open a bug report](https://github.com/thakurcodeshere/Attentra/issues/new?template=bug_report.md) with:

- A clear, descriptive title
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Screenshots or screen recordings (if applicable)
- Browser and OS information

### ✨ Suggest Features

Have an idea? [Open a feature request](https://github.com/thakurcodeshere/Attentra/issues/new?template=feature_request.md) with:

- A clear description of the problem you're solving
- Your proposed solution
- Alternative approaches you've considered
- Mockups or wireframes (bonus points! 🎨)

### 📝 Improve Documentation

Documentation improvements are always welcome:

- Fix typos, grammar, or unclear explanations
- Add missing documentation for existing features
- Write tutorials or guides
- Translate documentation to other languages

### 💻 Submit Code

Ready to write code? Here's how to find work:

| Label | Description | Difficulty |
|---|---|---|
| `good first issue` | Perfect for newcomers | 🟢 Easy |
| `help wanted` | Community help needed | 🟡 Medium |
| `bug` | Something isn't working | 🟡 Medium |
| `enhancement` | New feature or improvement | 🔴 Advanced |
| `documentation` | Docs improvements | 🟢 Easy |

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | ≥ 18.0 | `node --version` |
| npm | ≥ 9.0 | `npm --version` |
| Git | Latest | `git --version` |

### Setup Steps

```bash
# 1. Fork the repository on GitHub
# Click the "Fork" button at the top-right of the repo page

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Attentra.git
cd Attentra

# 3. Add upstream remote
git remote add upstream https://github.com/thakurcodeshere/Attentra.git

# 4. Install dependencies
npm install

# 5. Start the dev server
npm run dev
# → Open http://localhost:5173

# 6. Create a feature branch
git checkout -b feature/your-feature-name
```

### Useful Commands

```bash
npm run dev       # Start development server with HMR
npm run build     # Create production build
npm run lint      # Run ESLint checks
npm run preview   # Preview production build locally
```

---

## 🏗️ Project Architecture

Understanding the codebase before diving in:

```
src/
├── main.jsx                 # React DOM entry point
├── App.jsx                  # Global state manager + router + toast engine
├── index.css                # Full HSL design system
├── data/
│   └── mockData.js          # Seed database + localStorage persistence
└── pages/
    ├── LandingPage.jsx      # Public-facing marketing page
    ├── ClientPortal.jsx     # Campaign creation + analytics dashboard
    ├── ReviewerPortal.jsx   # Task marketplace + telemetry sandbox
    └── AdminPortal.jsx      # Fraud monitoring + system configuration
```

### Key Concepts

| Concept | File | Description |
|---|---|---|
| **State Management** | `App.jsx` | Centralized `useState` + `localStorage` sync |
| **Toast Notifications** | `App.jsx` | Queue-based system with auto-dismiss timers |
| **Role-based Routing** | `App.jsx` | `activeView` state switches between portals |
| **Design System** | `index.css` | HSL color tokens, glassmorphism cards, animations |
| **Fraud Engine** | `ReviewerPortal.jsx` | Keystroke dynamics, tab-focus, speed-run detection |
| **Canvas Charts** | `ClientPortal.jsx` | HTML5 Canvas for retention curves & heatmaps |
| **Mock Database** | `mockData.js` | Campaigns, reviews, user profiles, fraud logs |

---

## 🎨 Coding Standards

### JavaScript / React

- **React 19** — Use functional components with hooks exclusively
- **No class components** — All new components must be functional
- **Named exports** for utility functions, **default exports** for page components
- **Destructure props** in function signatures
- **Use `const`** by default, `let` when reassignment is needed, **never `var`**
- **No unused variables** — ESLint enforces this strictly

### CSS

- Use the existing **HSL design tokens** (e.g., `var(--primary)`, `var(--emerald)`)
- Follow the **BEM-inspired** naming convention used in `index.css`
- Add transitions for interactive states (`hover`, `focus`, `active`)
- Maintain the dark theme aesthetic — avoid hardcoded light colors

### File Naming

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ClientPortal.jsx` |
| Utilities | camelCase | `mockData.js` |
| Styles | kebab-case | `index.css` |
| Config files | kebab-case | `vite.config.js` |

---

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear, readable history:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, CI config, dependency updates |

### Examples

```bash
feat(client): add campaign duplication button
fix(reviewer): prevent double-submit on slow connections
docs(readme): add contributing guidelines
style(css): align pricing card heights on mobile
refactor(app): extract toast logic into custom hook
chore(ci): upgrade Node.js version in GitHub Actions
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Your branch is up-to-date with `master`
- [ ] `npm run lint` passes with **zero errors**
- [ ] `npm run build` completes **successfully**
- [ ] You've tested your changes in the browser
- [ ] You've added/updated documentation if needed

### PR Guidelines

1. **Fill out the PR template** completely
2. **Keep PRs focused** — one feature or fix per PR
3. **Write descriptive titles** using the commit convention format
4. **Add screenshots** for any visual changes
5. **Link related issues** using `Closes #123` or `Fixes #456`

### Review Process

1. A maintainer will review your PR within **48 hours**
2. Address any requested changes promptly
3. Once approved, a maintainer will merge your PR
4. Your contribution will be deployed automatically via Vercel 🚀

---

## 📋 Issue Guidelines

### Before Opening an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the discussions** tab for Q&A
3. **Try the latest version** — the bug might be fixed already

### Writing Good Issues

- **Use a clear title** that summarizes the problem
- **Provide context** — what were you trying to do?
- **Include reproduction steps** — the more specific, the better
- **Attach evidence** — screenshots, console errors, network logs

---

## 🌐 Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/thakurcodeshere/Attentra/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/thakurcodeshere/Attentra/issues)
- 🐦 **Twitter**: Follow [@thakurcodeshere](https://twitter.com/thakurcodeshere)

---

## 🏆 Contributors

Thanks to everyone who has contributed to Attentra!

<a href="https://github.com/thakurcodeshere/Attentra/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=thakurcodeshere/Attentra" />
</a>

---

<div align="center">

**Every contribution counts. Let's build the future of human attention telemetry together. 💜**

⭐ **Don't forget to star the repo!** It helps more people discover Attentra.

</div>
