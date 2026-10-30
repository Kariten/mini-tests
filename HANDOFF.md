# mini-tests 工作交接

更新时间：2026-10-30（Asia/Hong_Kong）。所有命令在仓库根目录运行。

## 当前维护方案

用户已决定将项目上传至个人 GitHub 账号 `Kariten`，通过 GitHub Pages 发布，停止维护原 ChatGPT Sites 部署。

- 仓库名：`mini-tests`；默认分支：`main`。
- Pages 发布来源：`main` 分支的 `/docs`，无需构建工具或额外的 Actions 配置文件。
- 已发布站点入口：`https://kariten.github.io/mini-tests/`；旅行测试为其下的 `travel/`。
- Git 远端：`https://github.com/Kariten/mini-tests.git`，本地 `main` 跟踪 `origin/main`。
- 首次上传与 Pages 部署已完成，HTTPS 已启用，线上答题、保存、筛选和 PNG 下载通过。页面源码提交为 `c91070db84f4c31857619e50c9c33d4035654498`；后续维护文档提交不改变 `docs/` 内容。
- 实际部署和验证记录见 [VALIDATION.md](VALIDATION.md)。

## 目录约定

- `docs/index.html`：MiniTests 导航首页，文档标题、品牌和页脚均为 MiniTests。
- `docs/travel/`：旅行偏好互检表，目前包含六个静态文件；`share.js` 保存该测试直达网址与静态二维码矩阵。
- `notes/travel/`：当前说明和完整题目汇总。
- `scripts/serve.py`：只监听本机，模拟 `/mini-tests/` 子路径。
- `friendship-questionnaire/`、`notes/travel/archive/`、历史来源链接、`artifacts/` 和 `outputs/`：仅作本地备份或验证，由 Git 忽略，不上传。

根仓库不继承旧 Sites 的 Git 历史、部署身份或配置。旧 Sites 保持停更，不再执行其源码同步或部署。

## 页面约束

旅行测试保留已有布局和四色分类，共 36 题（6 / 12 / 6 / 12），只填写 YES / NO，不计分、不判断匹配度。保留称呼、单题清除、筛选、浏览器保存和完整 PNG 导出。

用户要求移除题目来源和原图，已删除页面入口、弹窗、来源元数据、导出图中的来源文字，以及 `docs/travel/originals/`。后续不要恢复这些内容。

存储键保持 `before-we-go-preferences-v1`，题目编号及顺序保持稳定；新测试使用独立存储键。所有资源使用相对路径。旅行页面的 CSS 和三份 JS 使用相同版本参数，变更资源时同步更新版本以避免旧缓存。

用户要求测试之间独立访问：测试页只允许页内导航，不提供首页、其他测试或基于浏览历史的返回入口。MiniTests 首页用新标签页打开测试，设置 `noopener noreferrer`，避免把首页加入测试标签页的历史。不要用脚本劫持浏览器返回；公开网址手动输入仍可访问，同域部署不构成权限隔离。

结果 PNG 右下角必须带该测试正式网址的二维码及「扫码填写同款」。旅行测试二维码固定指向 `https://kariten.github.io/mini-tests/travel/`，本地导出也使用此正式地址。二维码直接逐格绘制，无外链图片或浏览器第三方依赖；换正式地址时运行 `scripts/generate-qr.py` 重新生成对应 `share.js` 并验证实际 PNG。

## 后续维护

1. 修改 `docs/` 中的源码，新增测试放到 `docs/<slug>/`，更新导航和根 README。
2. 运行 `python scripts/serve.py`，访问 `http://127.0.0.1:8736/mini-tests/` 检查子路径与功能。
3. 审阅差异，提交并推送 `main`，等待 GitHub Pages 部署成功。
4. 复查实际网址；将结果记录到 VALIDATION。不得把本机验证等同于线上验证。

旧域名与 GitHub Pages 的 localStorage 不会自动同步。原始备份及历史验证只保存在本地，不用于后续发布。
