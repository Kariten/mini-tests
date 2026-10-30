# 验证记录

日期：2026-10-30（Asia/Hong_Kong）。本文件记录统一目录后的验证；迁移前的旧功能验证原文仅保留在本地备份。

## 二维码、MiniTests 名称与独立访问（本地验证）

- 根页面 `<title>`、品牌、辅助文字和页脚已改为 MiniTests；入口提示在新标签页打开。桌面及 390 × 844 手机视口检查通过，手机页面 `scrollWidth=375`、视口宽 390，无页面横向溢出。
- 首页测试入口设置 `target="_blank" rel="noopener noreferrer"`。浏览器实际点击后产生独立测试标签页，首页保留在原标签页；新测试标签页返回操作提示没有上一页历史。
- 当前测试页唯一链接为 `#`，只返回顶部；没有跨测试、根首页或 `history.back()` 导航。独立访问按页面入口实现，公开 URL 不构成访问权限隔离。
- 新增测试独立的 `share.js`，二维码为 41 × 41 矩阵（含四模块白边），内容是 `https://kariten.github.io/mini-tests/travel/`。Canvas 使用整像素绘制二维码与「扫码填写同款」，不加载外部图片。
- 实际从单分类视图中导出 PNG，仍包含全部 36 题；两题已答，其余 34 题标为未答。PNG 为 1400 × 3552，底部二维码与题目、说明文字没有重叠。
- OpenCV 对浏览器实际下载的整张 PNG 及其 50% 缩小版本分别解码，均精确得到旅行测试直达 URL；已目视检查底部布局与提示文字。
- JavaScript 语法、资源相对路径和链接检查通过；本轮未记录浏览器 JavaScript 错误或警告。验证填写已撤销，临时视口已恢复。
- 本地产物：`artifacts/travel-with-qr.png`、`travel-qr-footer.png`、`minitests-home-desktop.png`、`minitests-home-mobile.png`，均被 Git 忽略。
- 本轮按现有 `main → /docs` 流程发布；线上结果以该提交关联的 GitHub Pages 流程及实际网址复查为准。

## GitHub 上传与 Pages 首次发布

- 已创建公开仓库 [Kariten/mini-tests](https://github.com/Kariten/mini-tests)，上传 17 个项目文件。页面源码提交：`c91070db84f4c31857619e50c9c33d4035654498`。
- 原 Sites 项目、隐藏 Git 元数据、旧归档及来源链接、原图、截图、发布包与临时发布脚本均未进入仓库。
- GitHub Pages 已启用：`main` 分支 `/docs`，`build_type=legacy`，`https_enforced=true`。
- 首次 [pages build and deployment](https://github.com/Kariten/mini-tests/actions/runs/41066919746) 已 `completed / success`；Pages 和最新构建均为 `built`，构建提交与上传提交一致。
- 首页：<https://kariten.github.io/mini-tests/>；旅行测试：<https://kariten.github.io/mini-tests/travel/>。
- 通过 HTTPS 获取八个公开 HTML / CSS / JS / SVG 文件，均返回 200，并与本地源码逐字节一致。原图、维护文档及 Sites 配置的站点路径返回 404。
- 浏览器从导航进入旅行测试，确认 36 题、4 类，无来源界面。选择第一题 YES 后进度正确，刷新恢复；组合筛选剩余五题。
- 筛选视图中的结果预览仍含全部 36 题，PNG 为 1400 × 3371；线上实际下载成功。验证答案已撤销，进度归零，未记录 JavaScript 错误或警告。
- 线上截图与下载样张保存在被忽略的 `artifacts/github-pages-home.png`、`github-pages-travel.png`、`github-pages-result.png`。
- 维护目标已切换为 GitHub Pages：后续推送 `main` 更新 `/docs`，不再同步或部署旧 ChatGPT Sites。

## 删除题目来源与原图后的检查

- 已删除网页的「题目来源」按钮、来源弹窗、图库脚本与样式、页脚来源说明，以及导出 PNG 中的来源文字。
- 已删除 `docs/travel/originals/` 中九张原图，旅行发布目录只剩五个静态文件；题库中的来源编号和相关元数据也已移除。
- 与旧题库逐项比较，36 道题的题干、示例、分类及顺序保持一致；存储键和题目编号保持稳定。JavaScript 语法检查通过。
- 浏览器刷新后确认显示 36 题，页面不存在来源入口与原图文字；选择答案后进度更新正确，结果预览与 PNG 下载正常，图片仍为 1400 × 3371。
- 为 CSS 和两份 JS 添加同一资源版本参数，解决预览浏览器复用旧脚本的缓存问题。再次刷新后页面正常，未记录新的 JavaScript 错误或警告；测试答案已撤销。
- HTML 资源链接与 ID 检查通过；九张已删除图片通过原路径请求均返回 HTTP 404。
- 当前页面截图：`artifacts/travel-without-source.png`；实际导出图：`artifacts/travel-without-source-result.png`。两者均被 Git 忽略。
- 此次改动作用于当前 `docs/` 网站。旧项目本地备份及内部历史资料单独保留，未重新发布旧 Sites。

## 初次迁移检查（移除来源前）

- **迁移一致性通过**：`docs/travel/` 的 14 个文件逐一计算 SHA-256，与旧 `dist/` 完全一致；其中含九张原图。两份来源资料和三份归档文档逐字节一致。
- **源码检查通过**：`node --check docs/travel/app.js` 和 `node --check docs/travel/questions.js` 成功；题库为 36 个不同题干，四类题数为 6 / 12 / 6 / 12。Python 预览脚本语法通过。
- **相对路径检查通过**：导航及测试 HTML / CSS 中的八个本地资源或页面目标都存在，没有域名根路径引用；18 个发布文件在 `/mini-tests/` 子路径下全部返回 HTTP 200，响应字节与磁盘文件一致。
- **预览服务检查通过**：仅绑定 `127.0.0.1`；默认首页重定向、无尾斜杠的 `/travel`、带查询串的目录链接及 HEAD 请求正常。额外验证 `/` 和 `/another-repo/` 两种前缀；前缀外路径与路径遍历请求不能取得仓库文档、旧配置或 `.git`。
- **浏览器导航通过**：从集合首页点击旅行入口，正确进入 `/mini-tests/travel/`，显示全部 36 题。
- **答题与保存通过**：填写称呼、YES / NO、修改答案、清除单题、进度更新正常；刷新后称呼和两题答案恢复。吃得开心分类及「只看未答」组合筛选正确，答过一题后显示剩余五题。
- **导出通过**：在单分类、只看未答视图中预览，仍生成四类全部 36 题；一题已答，其余 35 题标为未答。PNG 为 1400 × 3371 像素，下载成功并目视检查题干、示例、类别颜色与答案。
- **来源图通过**：在来源弹窗中确认九张图片均已成功加载。
- **清空通过**：取消清空保留答案，确认后称呼和答案归零。验证用答案已清空。
- **布局通过**：导航首页在默认桌面视口及 390 × 844 手机视口检查；旅行页面在手机视口检查。页面无水平溢出（手机 `scrollWidth` 为 375，视口宽 390，差值为滚动条）；类别栏可以独立横向滚动。临时视口设置已恢复。
- **控制台通过**：本轮浏览器日志未记录 JavaScript 错误或警告。
- **Git 检查通过**：根目录独立初始化 `main`，尚无提交、暂存文件或远端。原项目保持 `main`、README 修改、HANDOFF 未跟踪；备份目录、验证产物和输出文件被根仓库忽略。`docs/` 不含 `.git/` 或 Sites 配置。

## 本地产物

以下文件位于被 Git 忽略的 `artifacts/`，不在 Pages 发布目录：

- `home-desktop.png`：导航首页桌面全页截图。
- `home-mobile.png`：导航首页手机全页截图。
- `travel-mobile.png`：旅行测试手机视口截图。
- `travel-migrated-result.png`：本轮实际下载的完整结果图。

本轮使用本机 HTTP 验证，没有通过浏览器自动化验证 `file:` 双击打开。未重新识别原图或逐题重新录入整套答案；原有完整答题等历史验证见归档记录。

## 验证边界

本机检查与线上部署分别记录；未对中国大陆各运营商网络进行可达性实测。

原 Sites 的历史状态只作迁移记录；用户已指定停止维护 Sites，后续仅维护 GitHub Pages。

验证使用的常驻本地预览服务已停止；后续运行 `python scripts/serve.py` 可重新启动。
