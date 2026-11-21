#Requires -Version 5.1
<#
  Freebuff 简体中文界面补丁 · 安装器
  四个动作：Install / Restore / Status / Verify
  设计约束（来自 Capy 中文补丁的工程经验）：
    · 只加两处成对 marker，不重排、不删除别人的内容；
    · 装前备份 + 哈希校验，装后校验，还原前确认文件没被别人改过；
    · 所有写文件走「临时文件 → 读回校验 → 原子替换」；
    · 版本闸门：只对适配过的 Freebuff 版本动手。
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Install', 'Restore', 'Status', 'Verify')]
  [string]$Action,
  [string]$AppDir = '',
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$PatchRoot = $PSScriptRoot

$MetaPath = Join-Path $PatchRoot 'dist\patch-meta.json'
$AssetPath = Join-Path $PatchRoot 'dist\freebuff-zh-cn.js'
$PatchAppPath = Join-Path $PatchRoot 'tools\patch-app.mjs'
$StateRoot = Join-Path $env:LOCALAPPDATA 'FreebuffZh'
$ManifestPath = Join-Path $StateRoot 'manifest.json'
$SupportedPath = Join-Path $PatchRoot 'supported-versions.json'

function Write-Step($message) {
  Write-Host "  $message"
  try {
    if (-not (Test-Path $StateRoot)) { New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null }
    $line = '{0}  {1}' -f (Get-Date).ToString('s'), $message
    [System.IO.File]::AppendAllText((Join-Path $StateRoot 'install.log'), $line + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding($false)))
  } catch { }
}
function Fail($message) { Write-Host ""; Write-Host "× $message" -ForegroundColor Red; exit 1 }

function Resolve-AppDir {
  if ($AppDir) { return $AppDir }
  return (Join-Path $env:LOCALAPPDATA 'Programs\@codebufffreebuff-desktop')
}

function Resolve-Node {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) { return $node.Source }
  $bun = Join-Path (Resolve-AppDir) 'resources\bun\bun.exe'
  if (Test-Path $bun) { return $bun }
  Fail '找不到 Node.js 运行时。请安装 Node.js，或确认 Freebuff 自带 bun 仍在 resources\bun 下。'
}

function Get-Sha256($path) {
  return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Assert-AppIdle {
  $running = Get-Process -Name 'Freebuff' -ErrorAction SilentlyContinue
  if ($running -and -not $Force) {
    Fail 'Freebuff 正在运行。请先完全退出 Freebuff（含托盘图标），再重试。'
  }
}

function Read-Manifest {
  if (-not (Test-Path $ManifestPath)) { return $null }
  try { return Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { return $null }
}

function Write-Manifest($manifest) {
  New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
  $temp = "$ManifestPath.tmp"
  $json = $manifest | ConvertTo-Json -Depth 8
  [System.IO.File]::WriteAllText($temp, $json, (New-Object System.Text.UTF8Encoding($false)))
  Move-Item -LiteralPath $temp -Destination $ManifestPath -Force
}

function Get-SupportedVersions {
  if (-not (Test-Path $SupportedPath)) { return @() }
  $data = Get-Content -LiteralPath $SupportedPath -Raw -Encoding UTF8 | ConvertFrom-Json
  return @($data.versions)
}

function Invoke-Patcher([string]$command, [string[]]$extra) {
  $node = Resolve-Node
  $arguments = @($PatchAppPath, $command, '--app-dir', (Resolve-AppDir)) + $extra
  $output = & $node @arguments 2>&1
  if ($LASTEXITCODE -ne 0) { Fail ($output -join "`n") }
  return ($output -join "`n")
}

function Read-AppVersion {
  $node = Resolve-Node
  $raw = & $node $PatchAppPath 'version' '--app-dir' (Resolve-AppDir) 2>&1
  try { return (($raw -join "`n") | ConvertFrom-Json).appVersion } catch { return $null }
}

# ---------------------------------------------------------------- Status

function Show-Status {
  $dir = Resolve-AppDir
  $manifest = Read-Manifest
  Write-Host ''
  Write-Host 'Freebuff 中文补丁 · 状态' -ForegroundColor Cyan
  Write-Host "  应用目录   $dir"
  if (Test-Path $AssetPath) {
    $meta = Get-Content -LiteralPath $MetaPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Write-Host "  补丁版本   $($meta.version)（词表 $($meta.entries) 条，规则 $($meta.rules) 条）"
  }
  $verify = $null
  try { $verify = (Invoke-Patcher 'verify' @()) | ConvertFrom-Json } catch { }
  if ($verify) { Write-Host "  应用版本   $($verify.appVersion)" }
  if (-not $manifest) {
    Write-Host '  安装状态   未安装' -ForegroundColor Yellow
    Write-Host ''
    return
  }
  $installed = $verify -and $verify.ok
  if ($installed) { Write-Host '  安装状态   已安装' -ForegroundColor Green }
  else { Write-Host '  安装状态   已安装但文件被改动（可能 Freebuff 更新了，请重新安装）' -ForegroundColor Yellow }
  $asar = Join-Path $dir 'resources\app.asar'
  if (Test-Path $asar) {
    $now = Get-Sha256 $asar
    if ($now -ne $manifest.appAsar.patchedHash) {
      Write-Host '  注意       app.asar 与安装时不一致：Freebuff 可能已更新，请重跑安装' -ForegroundColor Yellow
    }
  }
  Write-Host "  安装时间   $($manifest.installedAt)"
  Write-Host "  备份目录   $($manifest.backupDir)"
  Write-Host ''
}

# ---------------------------------------------------------------- Install

function Install-Patch {
  $dir = Resolve-AppDir
  $asar = Join-Path $dir 'resources\app.asar'
  $shell = Join-Path $dir 'resources\orchestrator\ui\index.html'
  if (-not (Test-Path $asar)) { Fail "找不到 app.asar：$asar" }
  if (-not (Test-Path $shell)) { Fail "找不到界面入口：$shell" }
  if (-not (Test-Path $AssetPath)) { Fail "找不到汉化脚本：$AssetPath（先运行 npm run build）" }

  Assert-AppIdle

  $meta = Get-Content -LiteralPath $MetaPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $appVersion = Read-AppVersion
  $supported = Get-SupportedVersions
  if ($supported.Count -gt 0 -and $supported -notcontains $appVersion -and -not $Force) {
    Fail "当前 Freebuff 版本 $appVersion 不在适配列表（$($supported -join ' / ')）里。装上新版 Freebuff 后请先更新本补丁；确要继续可加 -Force。"
  }
  Write-Step "应用版本 $appVersion，补丁版本 $($meta.version)"

  $existing = Read-Manifest
  $shellText = Get-Content -LiteralPath $shell -Raw -Encoding UTF8
  $alreadyPatched = $shellText.Contains('<!-- freebuff-zh:start -->')

  # 补丁版本变了（例如新增了原生菜单/对话框的替换）就必须重打 asar，只刷新词表是不够的。
  $needsFullPatch = $alreadyPatched -and (-not $existing -or $existing.patchVersion -ne $meta.version -or $Force)
  if ($alreadyPatched -and $needsFullPatch) {
    Write-Step "补丁版本变化（$($existing.patchVersion) → $($meta.version)），先还原再重打"
    $raw = Invoke-Patcher 'restore' @('--backup', $existing.backupDir)
    if (-not $existing) { Fail '缺少安装记录，无法安全重打；请用官方安装包重装 Freebuff。' }
    $alreadyPatched = $false
  }

  if ($alreadyPatched) {
    Write-Step '检测到已安装，只更新词表' 
    Copy-Item -LiteralPath $AssetPath -Destination (Join-Path $dir 'resources\orchestrator\ui\freebuff-zh-cn.js') -Force
    Copy-Item -LiteralPath $AssetPath -Destination (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-cn.js') -Force
    Copy-Item -LiteralPath $AssetPath -Destination (Join-Path $StateRoot 'freebuff-zh-cn.js') -Force -ErrorAction SilentlyContinue
    if ($existing) {
      $existing.patchVersion = $meta.version
      $existing.entries = $meta.entries
      $existing.rules = $meta.rules
      $existing.asset.hash = (Get-Sha256 (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-cn.js'))
      $existing | Add-Member -NotePropertyName refreshedAt -NotePropertyValue ((Get-Date).ToString('s')) -Force
      Write-Manifest $existing
    } else {
      Write-Step '缺少安装记录，无法同步状态；请先运行「恢复英文.cmd」，再重新安装'
    }
    $verify = (Invoke-Patcher 'verify' @()) | ConvertFrom-Json
    if (-not $verify.ok) { Fail ('安装校验未通过：' + ($verify.problems -join '；')) }
    Write-Step '词表已更新，重新打开 Freebuff 生效'
    return
  }

  New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backupDir = Join-Path $StateRoot ("backup\$appVersion-$stamp")
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  Write-Step "备份到 $backupDir"
  Copy-Item -LiteralPath $asar -Destination (Join-Path $backupDir 'app.asar') -Force
  Copy-Item -LiteralPath $shell -Destination (Join-Path $backupDir 'index.html') -Force
  if ((Get-Sha256 (Join-Path $backupDir 'app.asar')) -ne (Get-Sha256 $asar)) { Fail '备份校验失败（app.asar）' }
  if ((Get-Sha256 (Join-Path $backupDir 'index.html')) -ne (Get-Sha256 $shell)) { Fail '备份校验失败（index.html）' }

  Write-Step '注入补丁'
  $raw = Invoke-Patcher 'apply' @('--asset', $AssetPath, '--backup', $backupDir)
  $result = $raw | ConvertFrom-Json

  Copy-Item -LiteralPath $AssetPath -Destination (Join-Path $StateRoot 'freebuff-zh-cn.js') -Force

  $manifest = [ordered]@{
    schemaVersion    = 1
    patchVersion     = $meta.version
    appVersion       = $appVersion
    appDir           = $dir
    installedAt      = (Get-Date).ToString('s')
    backupDir        = $backupDir
    shell            = [ordered]@{
      path         = $shell
      originalHash = $result.originalIndexHash
      patchedHash  = $result.patchedIndexHash
    }
    appAsar          = [ordered]@{
      path         = $asar
      originalHash = $result.originalAppAsarHash
      patchedHash  = $result.patchedAppAsarHash
    }
    asset            = [ordered]@{
      name = 'freebuff-zh-cn.js'
      path = (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-cn.js')
      hash = $result.assetHash
    }
    entries          = $meta.entries
    rules            = $meta.rules
  }
  Write-Manifest $manifest

  $verify = (Invoke-Patcher 'verify' @()) | ConvertFrom-Json
  if (-not $verify.ok) { Fail ('安装校验未通过：' + ($verify.problems -join '；')) }

  Write-Host ''
  Write-Host '✓ 安装完成' -ForegroundColor Green
  Write-Host "  中文界面在重新打开 Freebuff 后生效；词表共 $($meta.entries) 条。"
  Write-Host '  想还原：双击「恢复英文.cmd」。'
  Write-Host ''
}

# ---------------------------------------------------------------- Restore

function Restore-Patch {
  $dir = Resolve-AppDir
  $manifest = Read-Manifest
  if (-not $manifest) { Fail '没有找到安装记录，无法还原。若界面仍是英文，本来就不需要还原。' }
  Assert-AppIdle

  $asar = Join-Path $dir 'resources\app.asar'
  if (-not (Test-Path $asar)) { Fail "找不到 app.asar：$asar" }
  $current = Get-Sha256 $asar
  if ($current -ne $manifest.appAsar.patchedHash -and -not $Force) {
    Fail 'app.asar 与安装时记录的补丁版本不一致：Freebuff 可能已更新或文件被改动。请重装 Freebuff，或加 -Force 强制用备份还原。'
  }

  Write-Step '从备份还原'
  $raw = Invoke-Patcher 'restore' @('--backup', $manifest.backupDir)
  $result = $raw | ConvertFrom-Json
  if ($result.restoredAppAsarHash -ne $manifest.appAsar.originalHash) {
    Fail '还原后的 app.asar 哈希与安装前不一致，已中止。请用 Freebuff 官方安装包重装。'
  }
  if ($result.restoredIndexHash -ne $manifest.shell.originalHash) {
    Fail '还原后的 index.html 哈希与安装前不一致，已中止。请用 Freebuff 官方安装包重装。'
  }

  Remove-Item -LiteralPath $ManifestPath -Force
  Remove-Item -LiteralPath (Join-Path $StateRoot 'freebuff-zh-cn.js') -Force -ErrorAction SilentlyContinue

  Write-Host ''
  Write-Host '✓ 已还原英文界面' -ForegroundColor Green
  Write-Host '  备份仍留在备份目录，确认无误后可手动删除。'
  Write-Host ''
}

# ---------------------------------------------------------------- Verify

function Test-Patch {
  $verify = (Invoke-Patcher 'verify' @()) | ConvertFrom-Json
  Write-Host ''
  Write-Host 'Freebuff 中文补丁 · 自检' -ForegroundColor Cyan
  Write-Host "  应用版本       $($verify.appVersion)"
  Write-Host "  界面入口标记   $($verify.shellMarkers)"
  Write-Host "  app.asar 标记  $($verify.hostedMarkers)"
  $manifest = Read-Manifest
  if ($manifest) {
    $asset = $manifest.asset.path
    if (Test-Path $asset) {
      $ok = (Get-Sha256 $asset) -eq $manifest.asset.hash
      Write-Host ('  汉化脚本哈希   ' + $(if ($ok) { '与安装记录一致' } else { '与安装记录不一致（重跑安装即可同步）' }))
      if (-not $ok) {
        $verify.ok = $false
        $verify.problems = @($verify.problems) + '汉化脚本与安装记录不一致'
      }
    }
  }
  if ($verify.ok) { Write-Host '  结论           通过' -ForegroundColor Green; Write-Host '' ; return }
  $problems = @($verify.problems) | Where-Object { $_ }
  Write-Host ('  结论           未通过：' + ($problems -join '；')) -ForegroundColor Red
  Write-Host ''
  exit 1
}

switch ($Action) {
  'Install' { Install-Patch }
  'Restore' { Restore-Patch }
  'Status' { Show-Status }
  'Verify' { Test-Patch }
}
