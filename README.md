# Initex

🚀 **A simple and interactive CLI tool to quickly set up an Express.js project with best practices.**

Initex lets you scaffold a fully structured Express backend in minutes — with optional database, Socket.io, TypeScript, presets, and more.

---

## 🔥 Features

- **Interactive Setup** – Answer a few prompts and generate a full project.
- **Database Support** – MongoDB, MySQL, PostgreSQL, and ORM options.
- **Socket.io Integration** – Add real-time features instantly.
- **TS or JS** – Choose between TypeScript and JavaScript.
- **Clean Folder Structure** – Auto-generated `routes/`, `controllers/`, `models/`, etc.
- **Presets** – Reuse your config for future projects.
- **Generate Preset JSON** – Export your interactive answers automatically.

---

## 📦 Installation

Run with **npx**:

```bash
npx initex
```

Or install globally:

```bash
npm install -g initex
```

---

## 🛠 Usage

### Run interactively (default)

```bash
initex
```

### Specify a project name

```bash
initex myapp
```

---

## ⚙️ CLI Arguments

|Flag|Type|Description|
|---|---|---|
| `-n, --name`         | string  | Project name (optional). Can also be positional.                |
| `-p, --preset`       | boolean | string                                                          | Use preset mode. Path optional. If missing → presetPath = null.    |
| `-g, --generateJson` | boolean | string                                                          | Generate preset JSON. Path optional; defaults to a `.initex` file. |
| `-m, --mode`         | string  | Execution mode: `start`, `test`, `test:bin` (default: `start`). |

---

## 🧪 Examples

### **1. Default interactive setup**

```bash
initex
```

### **2. Interactive with name**

```bash
initex myapp
```

### **3. Use preset mode (no file required)**

```bash
initex -p
```

With a name:

```bash
initex myapp -p
```

### **4. Use preset with specific file**

```bash
initex -p ./presets
```

Or:

```bash
initex myapp -p ./config
```

### **5. Generate preset JSON automatically**

Default location:

```bash
initex -g
```

Custom output path:

```bash
initex myapp -g ./output
```

### **6. Test modes**

```bash
initex -m test
```

```bash
initex myapp -m test:bin
```

---

## 🎯 Summary

Initex now supports:

- Optional project names
- Optional preset paths
- Optional generateJson paths
- No conflicts between flags
- No hard errors for missing preset files
- Clean, deterministic config generation
- Fully lifecycle-safe outputs

Initex gives you a structured config object — and your engine handles the rest.

---

## 📂 GitHub

👉 **[https://github.com/Dhvanitmonpara/initex](https://github.com/Dhvanitmonpara/initex)**
