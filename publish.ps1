param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Test-Path -LiteralPath ".git")) {
    throw "当前目录不是 git 仓库：$PSScriptRoot"
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    throw "没有配置 origin。先创建 GitHub 仓库，再执行：git remote add origin git@github.com:yeco2656-jpg/dragonlauncher.git"
}

foreach ($file in @("downloads\DragonLauncher-修版.zip", "downloads\DragonLauncher-朋友原版.zip", "index.html")) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "缺少文件：$file"
    }
}

$status = git status --porcelain
if ($status) {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Update DragonLauncher site " + (Get-Date -Format "yyyy-MM-dd HH:mm")
    }
    git add -A
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) { throw "git commit 失败" }
} else {
    Write-Output "工作区没有变更，直接推送。"
}

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    throw "git push 失败。确认 GitHub 上已经创建 public 仓库，并且 SSH key 可用。"
}

Write-Output "已推送：$remote"
