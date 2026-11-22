# 龙裔启动器 · 主题包 v1

四套壁纸主题，给龙裔启动器 v0.6 / v0.7 用。每套是一个 zip，里面是 `theme.json`、一张壁纸、`light.css` 与 `dark.css`，浅色深色一起换。

| 主题 | id | 风格 | 默认 | zip 大小 |
|---|---|---|---|---|
| 雪线以上 | `snowline` | 高山雪脊、冷蓝强调色 | 浅色 | 752,143 B |
| 远海松林 | `fjord` | 峡湾松林、灰青强调色 | 深色 | 378,385 B |
| 峡谷飞瀑 | `gorge` | 峡谷瀑布、苔绿强调色 | 深色 | 462,128 B |
| 暮草逆光 | `goldenfield` | 逆光草坡、麦黄强调色 | 浅色 | 189,543 B |

## 怎么装

1. 打开启动器「主题」页，右上角点「从文件安装」，选下载好的 zip。
2. 或者点「从链接安装」，把下面任一 zip 的直链粘进去。
3. 装完主题卡片立即出现，点一下即切换；不想要了在卡片上删除，只删这一个目录。

也可以手动解压到 `themes/<id>/`，保证 `theme.json` 在目录第一层即可。

## 校验

`SHA256SUMS.txt` 里是四个包的值，PowerShell 下核对：

```powershell
Get-FileHash .\snowline.zip -Algorithm SHA256
```

## 兼容性

主题引擎在 v0.6.0 与 v0.7.0 里没有改动（`ThemePackManager`、`ThemePack`、`ThemePage`、`Theme` 四个 class 与三份 CSS 的 SHA256 一致），两个版本都能装。内置主题 id `golden` / `mc` / `dragon` 被占用，这四套不冲突。

## 素材与许可

四张壁纸都来自 Unsplash，经 Picsum 取图，遵循 Unsplash License（可免费使用与修改，不强制署名，但不可原样转售或拼成同类图库）。作者与原始页面：

- `snowline` — Go Wild, https://unsplash.com/photos/V0yAek6BgGk
- `fjord` — Paul Jarvis, https://unsplash.com/photos/6J--NXulQCs
- `gorge` — Paul Jarvis, https://unsplash.com/photos/NYDo21ssGao
- `goldenfield` — Alejandro Escamilla, https://unsplash.com/photos/LBI7cgq3pbM

主题的 CSS 结构沿用启动器自带的 `dragon_dark.css` / `dragon_light.css` 模板，只重算颜色位，布局与控件样式不动。
