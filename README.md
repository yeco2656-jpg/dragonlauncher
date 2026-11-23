# 龙裔启动器网站

> 静态站，无构建步骤。入口 `index.html`。
> 更新时间：2026-11-23（v0.8.6 点击不再卡顿版）
> 线上：<https://yeco2656-jpg.github.io/dragonlauncher/>（仓库 <https://github.com/yeco2656-jpg/dragonlauncher>，Pages 已开：main / root，HTTPS 强制）

## 一、是什么

给 DragonLauncher 修版和朋友原版做的下载站。**白色模式**：浅灰白底、真实日出雪山照片、白色实体卡片、橙色强调，带缓慢 Ken Burns 和 Canvas 火星粒子；不依赖外部 CDN、字体或框架。

版本 zip 挂在 GitHub Release（v0.1.0 – v0.8.6，另含朋友 0.2.0 增量包；v0.8.5 构建后冻结、未发布）；主题与角色皮肤不再发独立 Release，全部放在 `downloads/themes/`（九套 zip）和 `downloads/skins/`（六张 PNG），清单是 `themes.json` / `skins.json`，启动器的「在线主题库」「在线皮肤库」直接读这两份。

「公共作品库」区不写死卡片：`assets/library.js` 现场读 `repos/.../releases` 接口，把每个 Release 的附件按版本号倒序排成卡片。以后**谁发一版新 Release，网页刷新就自动多一张卡，不用改 HTML**；接口读不到时退回内置清单，下载按钮仍可用。`packages/` 只留 `.gitkeep` 当草稿区占位。

## 二、怎么用

本地预览：

```powershell
cd "D:\Doubao\账号A\龙裔启动器UI改版\网站"
start index.html
```

或者直接双击 `index.html`。所有资源都是相对路径。

上线 GitHub Pages：

1. ~~GitHub 新建 **Public** 仓库~~ → 已完成（2026-11-22，gh 代建 `yeco2656-jpg/dragonlauncher`，public）。
2. 本目录已 `git init`、提交，`origin` 指向 `git@github.com:yeco2656-jpg/dragonlauncher.git`；推送：

```powershell
git push -u origin main
```

3. ~~Settings → Pages 手动开~~ → 已用 API 开启：`main` / 根目录，HTTPS 强制。
4. 线上 <https://yeco2656-jpg.github.io/dragonlauncher/>，实测 HTTP 200（2026-11-22 21:2x）。

改完要重新发布，只需：

```powershell
git add -A; git commit -m "update site"; git push origin main
```

等 1–2 分钟 Pages 自动重建。

## 三、结构

```
网站\
├── index.html               # 唯一页面
├── .nojekyll                # 让 Pages 不做 Jekyll 处理
├── assets\
│   ├── site.css             # 全部样式
│   ├── site.js              # reveal / embers / 复制 SHA
│   ├── library.js           # 作品库：读 Releases 自动生成卡片
│   ├── preview-v86.png      # v0.8.6 首屏截图 1080×680（页面秒开，版本号 0.8.6）
│   ├── skin-v8.png / english-v8.png / settings-v8*.png / themes-v8*.png
│   ├── goldenfield-v8.png
│   ├── sunrise.jpg          # Victor Sobrado / Unsplash
│   └── favicon.svg
├── downloads\
│   ├── SHA256SUMS.txt       # 各版本包 + 朋友增量包的 SHA256（zip 本体都在 Releases）
│   ├── themes\              # 九套主题 zip + SHA256SUMS.txt + themes.json
│   └── skins\               # 六张 64×64 PNG + skins.json
├── packages\
│   └── .gitkeep             # 草稿区占位，保持上传目录存在
├── 上传新版本.ps1            # 发版一条龙：tag / Release / 附件 / 校验表
├── publish.ps1
└── README.md
```

页面区块：Hero → 简介 → 特性 → 界面展示 → v0.8 更新 → 主题库 → 皮肤库 → 下载 → 作品库 → FAQ → 结尾。

## 四、上线限制与常见问题

- **单文件**：Git 限制 100 MB；版本 zip 全部走 Releases，仓库里不再放大文件。
- **仓库体积**：约 8 MB（只有站点资源，zip 全在 Releases）；Pages 站点上限 1 GB。
- **带宽**：Pages 约 100 GB/月软限制；34.3 MB 的包大约能撑 2900 次下载，朋友之间足够。流量大了再迁 Releases 或对象存储。
- **公开性**：Public 仓库意味着任何人有链接都能下载；不要往 zip 里塞个人配置。
- **自定义域名**：Pages 设置里加 CNAME；本仓库暂未配置。
- **发新版本**：跑 `.\上传新版本.ps1 -ZipPath 包.zip -Tag v0.9.0`，或网页 `Releases → Draft a new release`。作品库会自动多一张卡，不用改 HTML。**不要往仓库里放 zip**：git 历史会膨胀，清理要 `filter-branch` + force push。
- **图片授权**：`sunrise.jpg` 为 Unsplash License，摄影 Victor Sobrado；页脚已署名。

## 五、维护

```powershell
cd "D:\Doubao\账号A\龙裔启动器UI改版\网站"
.\publish.ps1
```

`publish.ps1` 检查 git、remote、未提交变更，然后 commit + push；不会代建仓库。

发版用 `上传新版本.ps1`（完整参数见 `..\工具\README.md`）：校验 zip、文件名含中文自动转英文附件名、建 tag 与 Release、上传附件、更新 `downloads/SHA256SUMS.txt` 并提交推送。

回滚：

```powershell
git log --oneline
git checkout <上一个 commit> -- .
```

改颜色：`assets/site.css` 顶部 `:root` 和末尾“白色模式”里的 `--accent`、`--bg`、`--surface`。改照片：替换 `assets/sunrise.jpg`，CSS 里 `.hero-bg` 的 `url("sunrise.jpg")` 不用动。
