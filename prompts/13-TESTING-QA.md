# 13. Testing and Quality Assurance

- The project uses a directory-based test structure with `__tests__` folders placed alongside the code they test
- This allows for easier maintenance and better organization of test files related to specific components or functionality
- Key test directories include:
  - `src/__tests__/`: Top-level tests for core application functionality
  - `src/app/context/__tests__/`: Tests for React context providers
  - `src/app/hooks/__tests__/`: Tests for custom React hooks
  - `src/helpers/__tests__/`: Tests for utility functions
  - `src/services/__tests__/`: Tests for backend services
- While there's no explicit Jest configuration visible, the structure suggests Jest is likely used as the testing framework
- Additional testing tools that would benefit the project:
  - React Testing Library for component tests
  - Mock Service Worker (MSW) for API mocking
  - Playwright or Spectron for end-to-end testing of the Electron application

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
