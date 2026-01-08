# Initex

**Initex** is a simple, interactive CLI tool to scaffold an opinionated Express-based backend project using either guided prompts or reusable preset files.

It exists because backend setup is a boring loop of the same decisions every time. Runtime. Database. Auth. Cache. Tooling. Initex standardizes those choices, makes them explicit, and lets you reuse them without copy-pasting your soul between projects.

---

## Why Initex Exists

Setting up backend projects repeatedly involves answering the same questions:

* Which runtime?
* Which database and ORM?
* Rate limiting?
* Linting and formatting?
* Logging?
* Security headers?
* Auth or no auth?
* Cache?
* SMTP?
* Sockets?
* Tooling?

Initex solves this by:

* Making those decisions **explicit**
* Allowing them to be **saved and reused**
* Cutting setup time without hiding configuration behind magic

Minimal defaults. Everything else is opt-in.

---

## Features

* Interactive and preset-based project generation
* First-class preset file support
* Database, cache, auth, SMTP, and socket configuration
* Supports modern runtimes and package managers
* Explicit configuration, no hidden behavior

## Non-goals

Initex does not:
- Hide infrastructure decisions
- Generate frontend code
- Abstract away your business logic

---

## What It Generates

- See [Generated Project Structure](./docs/generated-structure.md) for details.

---

## Requirements

* Node.js
* A supported runtime:

  * Node.js
  * Bun
  * Deno
* A package manager:

  * npm
  * pnpm
  * yarn
  * bun
  * deno

(Your config decides which one actually matters.)

---

## Installation

### Install globally

```bash
npm install -g initex
```

### Run without installing

```bash
npx initex
```

---

## Quick Start

### Interactive setup

```bash
initex my-app
```

If no options are provided, Initex runs in interactive mode.

### Preset-based setup

```bash
initex --preset ./initex.preset.json
```

---

## Preset File Support

Initex supports preset files to fully automate project generation.

Presets let you:
- Reuse backend decisions across projects
- Avoid interactive prompts
- Make infrastructure choices explicit and versionable
- Presets are supported in JSON and YAML formats

### Example Preset

```json
{
  "name": "myawesomeapp",
  "runtime": "bun",
  "packageManager": "bun",
  "db": {
    "enable": true,
    "provider": "postgresql",
    "connectionString": "postgres://postgres:password@localhost:5432/myawesomeapp",
    "orm": "drizzle",
    "name": "myawesomeapp"
  },
  "cache": {
    "enable": true,
    "service": "multi"
  },
  "auth": {
    "enable": true
  },
  "smtp": {
    "enable": true,
    "service": "gmail"
  },
  "git": true,
  "socket": true
}
```

See [Preset File Schema](./docs/preset-schema.md) for the full list of supported options and validation rules.

---

## Generating a Preset

Generate a preset from an interactive run:

```bash
initex --generatePreset
```

### Default output location

```text
./<project-name>/.initex
```

### Custom path

```bash
initex --generatePreset ./initex.preset.json
```

---

## CLI Usage

```bash
initex [project-name] [options]
```

If no options are provided, Initex runs in interactive mode.

---

## Flags

| Flag               | Alias | Description                                  |
| ------------------ | ----- | -------------------------------------------- |
| `--mode`           | `-m`  | Execution mode (`start`, `test`, `test:bin`) |
| `--name`           | `-n`  | Project name                                 |
| `--preset`         | `-p`  | Use a preset file                            |
| `--generatePreset` | `-g`  | Generate a preset file                       |
| `--debug`          | `-d`  | Print resolved CLI configuration             |

---

## Example Outputs

> Add screenshots, CLI output snippets, or links to example repositories here.

Future-you will thank present-you for doing this.

---

## Contributing

1. Fork the repository
2. Create a focused branch
3. Make changes with clear commits
4. Add tests where applicable
5. Open a pull request

---

## Roadmap

2.1
* Improved OpenAPI documentation

2.2
* Idempotency support for critical APIs
* SQLite database support

2.3
* Admin authentication
* Updated RBAC model

2.4
* Valkey support for caching

Later versions
* BetterAuth integration
* AuthJS integration
* Clerk integration

---

## FAQ

**Q: Can presets be reused across projects?**
A: Yes. Presets are designed to be portable and reusable.

**Q: Does Initex require Bun if runtime is set to `bun`?**
A: Yes. The selected runtime must be installed locally.

---

## License

[MIT License](./LICENSE)
