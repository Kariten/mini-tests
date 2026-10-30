# mini-tests · 小测试集合

用一个仓库集中管理多个简单测试网页。每个测试都有独立目录，`docs/` 是 GitHub Pages 的完整发布内容。纯 HTML / CSS / JavaScript，无需安装依赖或构建。

接续工作请先读 [HANDOFF.md](HANDOFF.md) 和 [VALIDATION.md](VALIDATION.md)。

## 目录

```text
mini-tests/
  docs/                         GitHub Pages 发布根目录
    .nojekyll                   跳过 Jekyll 处理
    index.html                  测试导航首页
    favicon.svg
    assets/index.css            导航页样式
    travel/                     旅行偏好互检表（完整独立网页）
      index.html
      styles.css
      app.js
      questions.js
      favicon.svg
  notes/
    travel/                     测试说明与题目
      README.md
      题目汇总.md
  scripts/serve.py              仅绑定本机的预览服务
  HANDOFF.md
  VALIDATION.md
  friendship-questionnaire/   原 Sites 工作目录，本地保留并由 Git 忽略
```

`docs/` 内只放网站公开内容。维护文档放到 `notes/`，截图、导出图和 ZIP 放到被忽略的 `artifacts/`、`outputs/`。旧 Sites 项目、迁移前的归档资料与历史来源链接仅在本地备份，并由 Git 忽略。以后统一修改 `docs/` 中的页面。

## 本地使用

在仓库根目录运行（需要 Python 3，无第三方依赖）：

```powershell
python scripts/serve.py
```

打开 <http://127.0.0.1:8736/mini-tests/>，旅行测试位于 <http://127.0.0.1:8736/mini-tests/travel/>。按 `Ctrl+C` 停止。服务仅提供 `docs/` 内容，并模拟 GitHub 项目站点的子路径。

端口冲突时可运行 `python scripts/serve.py --port 8740`；仓库名变化时可用 `--base-path /新仓库名/`。也可以直接打开 `docs/index.html`，但本轮浏览器验证使用 HTTP。

## 已有测试

| 目录 | 名称 | 说明 |
| --- | --- | --- |
| `docs/travel/` | 一起出发前 · 旅行偏好互检表 | 36 题、4 类、YES / NO，不计分，可导出完整 PNG |

旅行测试的答案只保存在当前浏览器的 localStorage，不上传服务器。不同域名、浏览器或设备之间不会自动同步。迁往 GitHub Pages 前，可先从旧网站导出结果图。使用方法见 [旅行测试说明](notes/travel/README.md)。当前网页和导出图已移除题目来源展示，发布目录已删除九张原图。

## GitHub Pages 发布

仓库所属账号：`Kariten`。仓库名：`mini-tests`。本项目只维护 GitHub Pages 部署。

GitHub 仓库的 **Settings → Pages → Build and deployment** 使用以下发布来源：

- Source：**Deploy from a branch**
- Branch：**main**
- Folder：**/docs**

以后在本地修改页面、检查并提交，然后运行 `git push origin main`，GitHub 会自动发布 `/docs` 中的内容。此方案不需要额外构建或 Actions 配置文件。参见 [GitHub 官方发布来源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

仓库与访问地址（本轮部署完成后以验证记录为准）：

```text
https://github.com/Kariten/mini-tests
https://kariten.github.io/mini-tests/
https://kariten.github.io/mini-tests/travel/
```

原 ChatGPT Sites 部署已停止维护。本项目不包含 Sites 发布配置或同步流程；网站以后统一通过 GitHub Pages 更新。

## 新增测试

1. 在 `docs/<slug>/` 创建独立网页，例如 `docs/another-test/index.html`。目录名用小写英文和连字符。
2. 将该测试的 JS、CSS、图片放在自己的目录内，使用相对路径，如 `styles.css`、`assets/cover.svg`；避免 `/styles.css` 等域名根路径。
3. 如需本地保存，为新测试选独立的 localStorage 键；旅行测试使用 `before-we-go-preferences-v1`，应保持稳定。
4. 在 `docs/index.html` 添加入口卡片，并更新测试数量、本页表格；不必创建另一个仓库。
5. 将来源和说明放入 `notes/<slug>/`，按 [VALIDATION.md](VALIDATION.md) 检查子路径、手机布局和功能后再发布。

目前每个测试独立携带资源，导航页的共享样式只放在 `docs/assets/`。保持各测试可独立使用；需要时再提取公共资源。
