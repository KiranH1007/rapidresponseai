# Contributing to Rapid Response AI

Thank you for investing your time in contributing to our project! As an enterprise-grade application, we maintain high standards for code quality, security, and version control. 

Please read this document thoroughly to understand our workflow.

## 1. Branch Naming Strategy
We use a streamlined branching model. All active development happens on feature branches off of `main`.

**Format:** `<type>/<issue-number>-<short-description>`

*Examples:*
- `feat/101-user-auth`
- `fix/42-map-crash`
- `docs/update-readme`
- `refactor/api-routes`

## 2. Commit Message Guidelines
We strictly enforce **Conventional Commits** to auto-generate changelogs and maintain a readable history. 
If you are using an AI assistant to generate your commits, assure it is using our standard `.gitmessage` template format.

**Commit Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

- **Types Allowed:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Subject Line:** Max 50 characters, imperative mood, NO period at the end.
- **Body:** Max 72 characters per line. Explain what the change does and why.
- **Footer:** Use this to link issues (e.g., `Fixes #123`).

## 3. Pull Request Process
1. Push your feature branch to the remote repository.
2. Open a Pull Request targeting the `main` branch.
3. The PR description will automatically populate with our `PULL_REQUEST_TEMPLATE.md`. Fill it out completely.
4. Ensure all local tests pass and your code matches our linter requirements.
5. Request review from at least one core team member.

## 4. Coding Standards (TypeScript/React/Node)
- **Strict Typing:** Avoid `any` at all costs. Use well-defined interfaces and types.
- **Security:** Never commit `.env` or hardcoded SECRETS. Always access via environment variables or secret managers.
- **Clean Architecture:** Keep functions small, testable, and focused on a single responsibility.
- **Comments:** Comment *why* something is done, not *what*. The code should ideally be self-documenting.

*By adhering to these guidelines, you help us maintain a secure, robust, and scalable codebase.*
