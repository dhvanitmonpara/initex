## Preset Schema

### `name` (required)

Project name.

```json
"name": "myawesomeapp"
```

Must be a non-empty string.

---

### `runtime`

Runtime environment.

```json
"runtime": "node"
```

Supported values:

* `node` (default)
* `deno`
* `bun`

---

### `packageManager`

Package manager to use.

```json
"packageManager": "pnpm"
```

Supported values:

* `npm` (default)
* `yarn`
* `pnpm`
* `bun`
* `deno`

---

### `db`

Database configuration.

```json
"db": {
  "enable": true,
  "provider": "postgresql",
  "connectionString": "...",
  "orm": "drizzle",
  "name": "mydb"
}
```

#### Fields

* `enable`
  Boolean. Defaults to `false`.

When `enable: true`, the following fields become **required**:

* `provider`
  Supported values:

  * `mongodb`
  * `postgresql`
  * `mysql`

* `connectionString`
  Must be a valid URL string.

* `name`
  Database name. Non-empty string.

Optional:

* `orm`
  Supported values:

  * `mongoose`
  * `prisma`
  * `sequelize`
  * `drizzle`

---

### `cache`

Cache configuration.

```json
"cache": {
  "enable": true,
  "service": "multi"
}
```

#### Fields

* `enable`
  Boolean. Defaults to `false`.

* `service`
  Supported values:

  * `nodecache` – L1 in-memory cache
  * `multi` – L1 (NodeCache) + L2 (Redis)

> Note: `redis` alone is **not** currently supported by the schema.
> If you plan to add it, update both Zod and docs at the same time.

---

### `auth`

Authentication setup.

```json
"auth": {
  "enable": true
}
```

When enabled, authentication-related boilerplate is included.

---

### `smtp`

Email service configuration.

```json
"smtp": {
  "enable": true,
  "service": "resend"
}
```

#### Fields

* `enable`
  Boolean. Defaults to `false`.

* `service`
  Supported values:

  * `resend`
  * `gmail`

---

### `git`

Initialize a Git repository.

```json
"git": true
```

Defaults to `false`.

---

### `socket`

Enable socket support.

```json
"socket": true
```

Defaults to `false`.
