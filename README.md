# Initex

🚀 **A simple and interactive CLI tool to quickly set up an Express.js project with best practices.**

### 🔥 Features

- **Interactive Setup** – Choose your project configuration step by step.
- **Database Support** – MongoDB, MySQL, or other databases with ORM options.
- **Socket.io Integration** – Easily add real-time communication.
- **TypeScript or JavaScript** – Your choice!
- **Clean Folder Structure** – Auto-generates `routes/`, `controllers/`, `models/`, etc.
- **Custom Presets** – Save or load your setup preferences for future projects.

---

### 📦 Installation

Run the CLI using **npx**:

```bash
npx initex
```

Or install globally:

```bash
npm install -g initex
```

---

### 🛠 Usage

Run the CLI interactively:

```bash
initex
```

Or specify a project name directly:

```bash
initex myapp
```

---

### ⚙️ CLI Arguments

| Flag                 | Type    | Description                                       |
| -------------------- | ------- | ------------------------------------------------- |
| `-c, --custom`       | boolean | Run custom setup instead of preset                |
| `-p, --preset`       | boolean | Use preset setup (default: true)                  |
| `-g, --generateJson` | boolean | Generate a JSON config file for your custom setup |
| `-s, --savePreset`   | boolean | Save the current custom setup as a preset         |
| `-n, --name`         | string  | Specify your project name                         |

#### Examples

**Run custom setup with JSON generation and save as preset:**

```bash
initex myapp -c -g -s
```

**Run in test mode:**

```bash
initex -m test
```

**Run with a preset setup:**

```bash
initex myapp -p
```

---

🎯 **Save time and focus on building features, not boilerplate!**

👉 GitHub Repo: [https://github.com/Dhvanitmonpara/initex](https://github.com/Dhvanitmonpara/initex)
