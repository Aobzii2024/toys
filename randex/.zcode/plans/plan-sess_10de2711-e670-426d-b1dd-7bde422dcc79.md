# 修复界面显示异常

## 根因（已确认）

1. **误删前台核心 CSS（主因）**  
   清理“无关代码”时删除了 `public/style/css/` 下仍被引用的文件：
   - `content.css`、`small-x.css`、`small.css`、`medium.css`、`big.css`
   
   而 `public/style/css/index.css` 仍在 `@import` 它们：
   ```css
   @import url(content.css?LikeGirl=v5.2.0);
   @import url(small-x.css...);
   ...
   ```
   这些文件提供前台栅格、卡片、页头等布局。删除后前台（甚至后台因 root layout 也加载了 `index.css`）会出现严重样式错乱。

2. **后台布局 DOM 结构不完整（次因）**  
   当前结构：
   ```
   .admin-shell (flex row)
     ├── overlay
     ├── sidebar
     ├── topbar      ← 错误：与 main 平级
     └── .admin-main
           └── content
   ```
   正确应为 topbar 在 `.admin-main` 内。桌面端 topbar 隐藏所以不明显，移动端/窄屏会异常。

3. **Docker 镜像已 bake 进残缺 public/**  
   当前运行中的容器同样缺少这 5 个文件，需恢复后重建部署。

## 恢复来源

- 主源：`/home/admin/likegirl-next.tar.gz`（完整源码包，含上述 CSS）
- 备源：containerd 旧快照（snapshots/25 或 27）

## 修复步骤

### 1. 从 tar 包恢复误删的前台 CSS
从 `likegirl-next.tar.gz` 解压回：
- `public/style/css/content.css`
- `public/style/css/small-x.css`
- `public/style/css/small.css`
- `public/style/css/medium.css`
- `public/style/css/big.css`

**不恢复**真正无用的旧后台/登录 CSS（`public/style/css/admin.css`、`login.css` 等），避免再次混淆。

### 2. 修正后台 DOM 结构
- 调整 `AdminNav`：只渲染 `overlay + sidebar`
- 在 `app/admin/(panel)/layout.tsx` 中把 topbar 放进 `.admin-main`：
  ```
  .admin-shell
    overlay + sidebar
    .admin-main
      .admin-topbar   ← 正确位置
      .admin-content
  ```
- 如需移动端菜单开关，用简单回调/共享 state 或把 topbar 拆成 `AdminTopbar` 组件。

### 3. 加强 admin 样式隔离（可选但建议）
在 `admin.css` 中为 `.admin-body` 增加必要 reset（例如覆盖前台 `li { list-style }` 等全局规则），减少 root layout 里前台 CSS 对后台的干扰。

### 4. 重建并部署 Docker
```bash
docker compose up -d --build
```
验证：
- `curl -I http://127.0.0.1:3000/style/css/content.css` → 200
- 前台首页卡片/栅格正常
- 后台侧栏 + 内容区左右布局正常，无错位

### 5. 防止再犯
- 在 README 或简单脚本中标注：`content/small/medium/big` 为**前台必需**，不可删
- （可选）构建前检查这 5 个文件是否存在

## 不做的事
- 不回滚已完成的后台 UI 美化（admin.css / 导航 / flash / 审计页）
- 不恢复真正无引用的遗留资源

## 附：开发体验（你上次提到的“每次 build 麻烦”）
界面修好后，可另加开发热更新配置（本次优先修 UI）：
- **推荐**：停生产容器或改端口，本机 `npm run dev` 热更新
- 或新增 `docker-compose.dev.yml` 挂载源码跑 `next dev`

## 验收标准
- 前台首页/留言/相册布局恢复正常
- 后台桌面端：左侧深色导航 + 右侧内容，无顶栏挤占
- 后台移动端：顶栏菜单可打开侧栏
- 健康检查与登录仍可用