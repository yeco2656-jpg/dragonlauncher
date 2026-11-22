# 上传新版本.ps1
# 一条命令完成：校验 zip → 打 tag / 建 Release → 上传附件 → 更新 SHA256SUMS → 提交推送
# 用法示例：
#   .\上传新版本.ps1 -ZipPath "D:\打包\DragonLauncher-v0.7.0.zip" -Tag v0.7.0
#   .\上传新版本.ps1 -ZipPath "包.zip" -Tag v0.7.0-朋友 -Title "v0.7.0 朋友改版" -Notes "修了联机重连"
#   .\上传新版本.ps1 -ZipPath "包.zip" -Tag v0.7.0 -NoPush          # 只发 Release，不改仓库
#   .\上传新版本.ps1 -ZipPath "包.zip" -Tag v0.7.0 -Latest          # 同时标为最新版

param(
  [Parameter(Mandatory = $true)][string]$ZipPath,
  [Parameter(Mandatory = $true)][string]$Tag,
  [string]$Title = "",
  [string]$Notes = "",
  [string]$Repo = "yeco2656-jpg/dragonlauncher",
  [string]$GhPath = "D:\APP\gh\bin\gh.exe",
  [switch]$Latest,
  [switch]$NoPush
)

$ErrorActionPreference = 'Stop'

function Ok($m) { Write-Host "✓ $m" -ForegroundColor Green }
function Warn($m) { Write-Host "! $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "✗ $m" -ForegroundColor Red; exit 1 }

# ---------- 1. 找 gh ----------
$gh = $GhPath
if (-not (Test-Path -LiteralPath $gh)) {
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) { $gh = $cmd.Source } else { Fail "找不到 gh。先装 GitHub CLI（winget install --id GitHub.cli），或用 -GhPath 指向 gh.exe。" }
}
$loginCheck = (& $gh auth status 2>&1 | Out-String)
if ($loginCheck -notmatch 'Logged in') { Fail "gh 还没登录。先在 PowerShell 里跑 gh auth login，再回来。" }
$acct = (($loginCheck -split "`n" | Select-String -Pattern 'account') -join '').Trim()
Ok "gh 已登录：$acct"

# ---------- 2. 校验文件 ----------
if (-not (Test-Path -LiteralPath $ZipPath)) { Fail "找不到文件：$ZipPath" }
$zip = Get-Item -LiteralPath $ZipPath
if ($zip.Extension.ToLower() -ne '.zip') { Fail "只支持 .zip 包（当前后缀：$($zip.Extension)）。" }
if ($zip.Length -ge 2GB) { Fail "文件超过 2 GB，GitHub 单个 Release 附件放不下。" }
$hash = (Get-FileHash -LiteralPath $zip.FullName -Algorithm SHA256).Hash.ToUpper()
Ok ("文件 {0} / {1} MB / SHA256 {2}" -f $zip.Name, [math]::Round($zip.Length / 1MB, 1), $hash)

# ---------- 3. 附件名必须可放进 URL ----------
$assetName = $zip.Name
if ($assetName -match '[^\x20-\x7E]') {
  $slug = ($Tag -replace '^v', '') -replace '[^0-9A-Za-z.\-]', '-'
  $assetName = "DragonLauncher-$slug.zip"
  Warn "文件名有中文，附件改用英文名：$assetName"
}
$assetPath = Join-Path $env:TEMP $assetName
Copy-Item -LiteralPath $zip.FullName -Destination $assetPath -Force

# ---------- 4. tag 规范 ----------
if ($Tag -notmatch '^v?[0-9]') { Warn "tag 建议以 v 开头加版本号，比如 v0.7.0；继续用 $Tag。" }
if (-not $Tag.StartsWith('v')) { Warn "tag 不以 v 开头，GitHub 上也能用，只是和现有版本不统一。" }

# ---------- 5. 建或更新 Release ----------
$exists = $false
& $gh release view $Tag --repo $Repo 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { $exists = $true }

if ($exists) {
  & $gh release upload $Tag $assetPath --repo $Repo --clobber 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { Fail "上传附件失败，检查网络或 gh 登录状态。" }
  Ok "版本 $Tag 已存在，附件已覆盖上传（旧附件不会被删）"
}
else {
  if (-not $Title) { $Title = "v$($Tag -replace '^v', '') 新版本" }
  if (-not $Notes) { $Notes = ("手动上传`n`nSHA256: " + $hash) }
  & $gh release create $Tag $assetPath --repo $Repo --title $Title --notes $Notes 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { Fail "建 Release 失败。如果是 tag 冲突，先在网页删掉旧 tag 再试。" }
  Ok "已创建 Release $Tag"
}

if ($Latest) {
  & $gh release edit $Tag --repo $Repo --latest 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { Ok "已标为最新版（Latest）" }
}

$url = "https://github.com/$Repo/releases/download/$Tag/$assetName"
Ok "下载直链：$url"

# ---------- 6. 更新 SHA256SUMS（只在网站仓库里做） ----------
$sums = Join-Path $PSScriptRoot 'downloads\SHA256SUMS.txt'
$isRepo = (Test-Path -LiteralPath (Join-Path $PSScriptRoot '.git'))
if ((Test-Path -LiteralPath $sums) -and $isRepo -and -not $NoPush) {
  $lines = @(Get-Content -LiteralPath $sums -Encoding utf8)
  $kept = $lines | Where-Object { $_ -notmatch ([regex]::Escape($assetName)) }
  $kept += ("$hash  $assetName")
  Set-Content -LiteralPath $sums -Value $kept -Encoding utf8
  & git -C $PSScriptRoot add -A 2>&1 | Out-Null
  & git -C $PSScriptRoot commit -m "发布 $Tag：$assetName" 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) {
    & git -C $PSScriptRoot push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "SHA256SUMS 已更新并推送" } else { Warn "SHA256SUMS 已提交但推送失败，稍后手动 git push" }
  }
  else { Warn "SHA256SUMS 没有变化，跳过提交" }
}
else {
  Warn "没在网站仓库里（或用了 -NoPush），跳过 SHA256SUMS 更新"
}

Write-Host ""
Ok "完成。刷新 https://yeco2656-jpg.github.io/dragonlauncher/ 作品库即可看到新版本。"
Write-Host "下载验证：$gh release download $Tag --repo $Repo --pattern `"$assetName`""
