# Changelog

All notable changes to this project are documented in this file.

## 2.1.31

### Fixed

- missing variables issue in `.env` file

## 2.1.3

### Added

- Redis Session Store

### Changed

- Separated Redis client instance creation in a single file
- Updated registration workflow in auth module
- Improved cache keys handling in cache module
- Temporarily downgraded TypeScript to v5.9.3 due to breaking changes in module resolution and path aliasing in v6

### Fixed

- `err` object logging bug in `error.middleware.ts` template

### Removed

- Multiple context injecting functions in different files
- Cache provider selection is not optional anymore

## 2.1.2

### Fixed

- `docs/openapi` schema inconsistencies
- schema bloats in all over the template 

### Changed

- zod validation pattern for the controllers

## 2.1.1

### Fixed

- `middlewares/index.ts` redundant exports
- Redis authentication configuration
- `mail/templates/index.ts` file imports

## 2.1.0

### Added

- OpenAPI schemas are now defined using `defineSchema` utility

### Fixed

- OpenAPI schemas

### Changed

- Moved Request validation logic into controller level
- Now Global Error handler (middleware) handles zod validation errors

### Removed

- `validate-request` middleware

---

## 2.0.39

### Added

* MIT License

### Fixed

* Import path in `src/lib/validation.ts`

### Changed

* README `Why Initex exists` and `Requirements` section
* Inconsistency in `generated-structure.md`

---

## 2.0.37

### Fixed

* Prisma transaction issues
* HTTP type issues

---

## 2.0.36

### Added

* Logging support in templates

---

## 2.0.35

### Added

* Support for Prisma v7

---

## 2.0.34

### Added

* Middleware composition support

---

## 2.0.33

### Fixed

* Build issues related to scripts

---

## 2.0.31

### Fixed

* HTTP wrapper template issues

---

## 2.0.30

### Fixed

* Authentication module issues
* HTTP wrapper template issues

---

## 2.0.22

### Fixed

* Prisma configuration issues

---

## 2.0.21

### Fixed

* Mail and OTP service inconsistencies

### Added

* `templates/send.tsx` for SMTP module

---

## 2.0.2

### Changed

* Updated SMTP addon implementation

---

## 2.0.1

### Added

* Husky support

### Fixed

* Mail service issues

---

## 2.0.0

### Added

* Redis Docker Compose configuration
* Resend email service support
* Dependency Injection support across all modules

### Changed

* Improved CLI experience
* Refactored folder structure to feature-based monolith architecture
* Improved handling of missing runtimes and package managers

### Removed

* JavaScript support (TypeScript-only going forward)
