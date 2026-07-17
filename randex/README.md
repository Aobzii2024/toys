# LikeGirl Next (`likegirl-next`)

情侣站点 LikeGirl 的 **Next.js 重写版**（原 PHP 项目见上级目录）。

A modern Next.js (App Router) rewrite of the classic LikeGirl couple site: public pages + admin panel, SQLite storage, local file uploads.

- **Runtime**: Node.js 22 LTS recommended  
- **Stack**: Next.js 15 · React 19 · better-sqlite3 · iron-session  
- **Data**: SQLite database + local upload directory  

---

## 功能概览 / Features

- 前台：首页恋爱计时、文章（小记）、留言、相册、恋爱清单、关于我们  
- 后台：仪表盘、站点设置、文章/留言/相册/清单管理、安全设置  
- 演示数据：`SEED_DEMO=true` 时首次启动可写入 demo 内容  

---

## 环境变量 / Environment

复制 `.env.example` 为 `.env` 后按需修改：

| 变量 | 说明 | 默认示例 |
|------|------|----------|
| `SESSION_SECRET` | Session 加密密钥（建议 ≥32 字符随机串） | `change-me-to-a-long-random-string` |
| `ADMIN_USER` | 后台登录用户名 | `admin` |
| `ADMIN_PASSWORD` | 后台登录密码 | `changeme` |
| `DATABASE_PATH` | SQLite 文件路径 | `./data/likegirl.db` |
| `UPLOAD_DIR` | 上传文件目录 | `./data/uploads` |
| `SEED_DEMO` | 是否写入演示数据（`"true"` / `"false"`） | `true` |
| `COOKIE_SECURE` | Session Cookie 是否带 Secure（HTTPS 时设 `true`） | `false` |

Docker 中建议使用持久卷路径：

- `DATABASE_PATH=/data/likegirl.db`
- `UPLOAD_DIR=/data/uploads`

---

## 本地开发 / Local development

**推荐：Node.js 22 LTS。**  
`better-sqlite3` 为原生模块。Windows 上若预编译失败，应用会自动回退到 Node 内置 `node:sqlite`（Node 22.5+ / 24 可用），本机仍可 `npm run dev`。  
Docker 生产环境使用 `better-sqlite3` 原生绑定。

### 方式 A：本机热更新（最快）

```bash
cp .env.example .env
npm install
npm run dev
```

打开 http://localhost:3000 — 改代码即刷新，**无需 docker build**。

### 方式 B：Docker 开发热更新（改代码不用 rebuild）

生产镜像每次 `docker compose up --build` 都会完整 `next build`（通常 1～3 分钟），**日常改代码不要用生产构建**。

开发请用热更新：源码挂载 + `next dev`，保存即生效：

```bash
# 先停生产容器（避免抢 3000 端口）
npm run docker:down

# 启动开发容器（仅首次拉依赖较慢）
npm run docker:dev
```

改 `app/`、`components/`、`lib/`、`public/` 会自动热更新。结束开发：

```bash
npm run docker:dev:down
# 发布到生产再构建一次：
npm run docker:prod
```

| 场景 | 命令 | 是否每次全量 build |
|------|------|-------------------|
| 日常改 UI/功能 | `npm run docker:dev` 或 `npm run dev` | 否（热更新） |
| 正式发布 | `npm run docker:prod` | 是（必要） |

后台：http://localhost:3000/admin/login （默认见 `.env` / compose 环境变量）

### 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本机开发服务器（热更新） |
| `npm run docker:dev` | Docker 开发热更新 |
| `npm run docker:prod` | 生产镜像构建并后台启动 |
| `npm run docker:down` | 停止生产 compose |
| `npm run build` | 生产构建（standalone） |
| `npm start` | 启动生产服务 |
| `npm test` | 运行 Vitest |

---

## Docker

项目已配置多阶段构建（`node:22-bookworm-slim`），并针对 `better-sqlite3` 原生模块做了拷贝处理。

```bash
docker compose up -d --build
```

- 应用：http://localhost:3000  
- 健康检查：`GET /api/health`  
- 默认管理员：环境变量 `ADMIN_USER` / `ADMIN_PASSWORD`（`docker-compose.yml` 中请务必改掉占位密码）  
- 数据卷：`likegirl-data` → 容器内 `/data`（数据库 + 上传文件）

停止：

```bash
docker compose down
```

仅删除容器、保留数据卷：

```bash
docker compose down
# 数据仍在 named volume: likegirl-data
```

### 备份 / Backup

持久化内容都在 volume `likegirl-data`（`/data`）：

- 数据库：`/data/likegirl.db`
- 上传：`/data/uploads/`

示例（主机侧备份 volume 中的文件，按本机 Docker 路径调整）：

```bash
docker compose exec app ls -la /data
# 或将 volume 挂到临时容器后 tar 打包
docker run --rm -v likegirl-next_likegirl-data:/data -v "%cd%:/backup" alpine \
  tar czf /backup/likegirl-backup.tgz -C /data .
```

---

## 与旧版 PHP 的关系 / Relation to legacy PHP

| | 旧版 PHP | 本仓库 `likegirl-next` |
|--|----------|------------------------|
| 位置 | 上级目录（原 LikeGirl v5.x PHP） | 本目录 |
| 运行时 | PHP + MySQL/MariaDB 等 | Node.js + SQLite |
| 前台资源 | `style/`、`botui/` 等 | 已拷贝到 `public/style`、`public/botui` |
| 数据 | 独立数据库 | **不自动迁移**；需自行导出/导入内容 |

本项目为 **功能重写**，不是在 PHP 上包一层。可与旧站并行部署；迁移时请手动搬运文案、图片与业务数据。

---

## 生产注意 / Production notes

1. 务必修改 `SESSION_SECRET`、`ADMIN_PASSWORD`  
2. 生产环境可将 `SEED_DEMO=false`  
3. `next.config.ts` 已启用 `output: "standalone"`，与 Dockerfile 一致  
4. 反向代理时请转发到 `PORT`（默认 3000），并保留上传与 DB 路径可写  
5. **前台必需 CSS**（勿删）：`public/style/css/content.css`、`small.css`、`small-x.css`、`medium.css`、`big.css`（由 `index.css` 引入，负责栅格与布局）  

---

## License / 说明

基于原 LikeGirl 项目理念的 Next.js 重写版本，仅供学习与个人部署使用。请遵守原项目及相关依赖的许可协议。
