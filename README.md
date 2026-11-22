# 龙裔启动器网站

> 静态站，无构建步骤。入口 `index.html`。
> 更新时间：2026-11-22
> 线上：<https://yeco2656-jpg.github.io/dragonlauncher/>（仓库 <https://github.com/yeco2656-jpg/dragonlauncher>，Pages 已开：main / root，HTTPS 强制）

## 一、是什么

给 DragonLauncher 修版和朋友原版做的下载站。**白色模式**：浅灰白底、真实日出雪山照片、白色实体卡片、橙色强调，带缓慢 Ken Burns 和 Canvas 火星粒子；不依赖外部 CDN、字体或框架。

四个 zip 不再进仓库，改挂在 GitHub Release（v0.1.0 – v0.6.0），`downloads/` 只留 `SHA256SUMS.txt`；本地双击 `index.html` 仍能浏览页面，下载按钮会跳到 Release 附件。

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
│   ├── preview.png          # 修版实际截图 1080×680
│   ├── sunrise.jpg          # Victor Sobrado / Unsplash
│   └── favicon.svg
├── downloads\
│   └── SHA256SUMS.txt          # 五个版本 zip 的 SHA256（zip 本体在 Releases）
├── publish.ps1
└── README.md
```

页面区块：Hero → 简介 → 特性 → 界面展示 → 下载 → FAQ → 结尾。

## 四、上线限制与常见问题

- **单文件**：Git 限制 100 MB；版本 zip 全部走 Releases，仓库里不再放大文件。
- **仓库体积**：约 29 MB（站点资源 + `packages/` 里的更新包）；Pages 站点上限 1 GB。
- **带宽**：Pages 约 100 GB/月软限制；45.7 MB 的包大约能撑 2200 次下载，朋友之间足够。流量大了再迁 Releases 或对象存储。
- **公开性**：Public 仓库意味着任何人有链接都能下载；不要往 zip 里塞个人配置。
- **自定义域名**：Pages 设置里加 CNAME；本仓库暂未配置。
- **更新安装包**：替换 `downloads/` 里的 zip，改 `index.html` 里的文件大小和 SHA，再 commit/push。
- **图片授权**：`sunrise.jpg` 为 Unsplash License，摄影 Victor Sobrado；页脚已署名。

## 五、维护

```powershell
cd "D:\Doubao\账号A\龙裔启动器UI改版\网站"
.\publish.ps1
```

`publish.ps1` 检查 git、remote、未提交变更，然后 commit + push；不会代建仓库。

回滚：

```powershell
git log --oneline
git checkout <上一个 commit> -- .
```

改颜色：`assets/site.css` 顶部 `:root` 和末尾“白色模式”里的 `--accent`、`--bg`、`--surface`。改照片：替换 `assets/sunrise.jpg`，CSS 里 `.hero-bg` 的 `url("sunrise.jpg")` 不用动。
