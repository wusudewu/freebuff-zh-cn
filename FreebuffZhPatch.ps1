#Requires -Version 5.1
<#
  Freebuff 简体中文界面补丁 · 安装器
  四个动作：Install / Restore / Status / Verify
  设计约束（来自 Capy 中文补丁的工程经验）：
    · 只加两处成对 marker + 几张原生文案表，不重排、不删除别人的内容；
    · 装前备份 + 哈希校验，装后校验，还原前确认文件没被别人改过；
    · 所有写文件走「临时文件 → 读回校验 → 原子替换」；
    · 版本闸门：只对适配过的 Freebuff 版本动手。
  -Force 只放宽三道保护闸门：版本不在适配列表、文件与安装记录不一致、进程空闲检查。
  它不会让安装变得更「彻底」；用它之前请自己确认 Freebuff 真的关干净、也没被原地更新过。
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
    $logPath = Join-Path $StateRoot 'install.log'
    # 只留一代历史：超过 512 KB 就滚成 install.log.1，长期用不会无限长大。
    if ((Test-Path $logPath) -and ((Get-Item -LiteralPath $logPath).Length -gt 512KB)) {
      Move-Item -LiteralPath $logPath -Destination "$logPath.1" -Force
    }
    [System.IO.File]::AppendAllText($logPath, $line + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding($false)))
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
  # 不只认 Freebuff：更新器（Freebuff Update / freebuff-desktop 等）也会占着 app.asar。
  $running = @(Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like '*freebuff*' })
  if ($running.Count -gt 0 -and -not $Force) {
    $names = ($running | ForEach-Object { $_.ProcessName } | Sort-Object -Unique) -join '、'
    Fail "检测到 Freebuff 相关进程还在运行：$names。请完全退出 Freebuff（含托盘图标与更新器），再重试。"
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
  # 这份清单丢了就等于「所有版本都适配」，那是静默放行——宁可停下来。
  if (-not (Test-Path $SupportedPath)) { Fail "补丁包不完整：缺少 $SupportedPath（适配版本清单）" }
  $data = Get-Content -LiteralPath $SupportedPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $versions = @($data.versions)
  if ($versions.Count -eq 0) { Fail "适配版本清单是空的：$SupportedPath" }
  return $versions
}

function Invoke-Patcher([string]$command, [string[]]$extra) {
  $node = Resolve-Node
  $arguments = @($PatchAppPath, $command, '--app-dir', (Resolve-AppDir)) + $extra
  # $ErrorActionPreference='Stop' 下，node 往 stderr 写一行就会变成终止性 NativeCommandError，
  # 连「离开码非零」都判断不到。这里只在调用期间降成 Continue，失败仍由下面的退出码判断处理。
  $ErrorActionPreference = 'Continue'
  $output = & $node @arguments 2>&1
  $code = $LASTEXITCODE
  if ($code -ne 0) { Fail ($output -join "`n") }
  return ($output -join "`n")
}

function Read-AppVersion {
  $node = Resolve-Node
  $ErrorActionPreference = 'Continue'
  $raw = & $node $PatchAppPath 'version' '--app-dir' (Resolve-AppDir) 2>&1
  try { return (($raw -join "`n") | ConvertFrom-Json).appVersion } catch { return $null }
}

function Get-PatchVerify {
  # 自检在「没装/文件被改动」时会以非零码退出，这是正常结论，不能把 Status 一起 exit 掉。
  # 结果走 --json-out 落成文件：既不用处理 PS 5.1 对原生 stderr 的 NativeCommandError，
  # 也不受路径里空格的影响（call operator 会正确加引号，Start-Process 的 -ArgumentList 不会）。
  $node = Resolve-Node
  $jsonFile = Join-Path ([System.IO.Path]::GetTempPath()) ('fbzh-verify-' + [guid]::NewGuid().ToString('N') + '.json')
  # 同上：node 只要往 stderr 写东西（哪怕是「asar 读不出来」这种正常结论），Stop 就会把它变成异常。
  $ErrorActionPreference = 'Continue'
  try {
    $output = & $node $PatchAppPath 'verify' '--app-dir' (Resolve-AppDir) '--asset' $AssetPath '--json-out' $jsonFile 2>&1
    if (Test-Path $jsonFile) {
      try { return (Get-Content -LiteralPath $jsonFile -Raw -Encoding UTF8 | ConvertFrom-Json) } catch { return $null }
    }
    $head = (@($output) | Select-Object -First 3) -join ' / '
    if ($head) { Write-Host "  自检没能返回结果（node 输出：$head）" -ForegroundColor Yellow }
    return $null
  } finally {
    if (Test-Path $jsonFile) { Remove-Item -LiteralPath $jsonFile -Force -ErrorAction SilentlyContinue }
  }
}

# ---------------------------------------------------------------- Status

function Show-Status {
  $dir = Resolve-AppDir
  $manifest = Read-Manifest
  $asar = Join-Path $dir 'resources\app.asar'
  $shell = Join-Path $dir 'resources\orchestrator\ui\index.html'
  Write-Host ''
  Write-Host 'Freebuff 中文补丁 · 状态' -ForegroundColor Cyan
  Write-Host "  应用目录   $dir"
  if ((Test-Path $AssetPath) -and (Test-Path $MetaPath)) {
    $meta = Get-Content -LiteralPath $MetaPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Write-Host "  补丁版本   $($meta.version)（词表 $($meta.entries) 条，规则 $($meta.rules) 条）"
  } else {
    Write-Host '  补丁版本   未知（dist 里缺构建产物，先运行 npm run build）' -ForegroundColor Yellow
  }

  if (-not (Test-Path $asar)) {
    Write-Host '  安装状态   找不到 app.asar（Freebuff 可能没装在这个目录）' -ForegroundColor Yellow
    Write-Host ''
    return
  }

  $verify = Get-PatchVerify
  if ($verify -and $verify.appVersion) {
    Write-Host "  应用版本   $($verify.appVersion)"
  } elseif ($verify) {
    # 自检跑起来了但读不到版本号：asar 里的 package.json 没解析出来（通常就是 asar 损坏）。
    Write-Host '  应用版本   读不出来（app.asar 里的 package.json 没读到，可能已损坏）' -ForegroundColor Yellow
  } else {
    Write-Host '  应用版本   未知（自检没能运行）' -ForegroundColor Yellow
  }
  $marked = (Test-Path $shell) -and ((Get-Content -LiteralPath $shell -Raw -Encoding UTF8).Contains('<!-- freebuff-zh:start -->'))

  if (-not $manifest) {
    if ($marked) {
      Write-Host '  安装状态   界面里有补丁痕迹，但缺少安装记录：请用 Freebuff 官方安装包重装，再安装补丁' -ForegroundColor Yellow
    } else {
      Write-Host '  安装状态   未安装' -ForegroundColor Yellow
    }
    Write-Host ''
    return
  }

  $asarNow = Get-Sha256 $asar
  if (-not $marked -or $asarNow -ne $manifest.appAsar.patchedHash) {
    $driftProblems = @($verify.problems) | Where-Object { $_ }
    if (($driftProblems -join '；') -match '读不出来') {
      Write-Host '  安装状态   app.asar 已损坏，补丁无从校验：请用 Freebuff 官方安装包重装，再装中文补丁' -ForegroundColor Red
    } else {
      Write-Host '  安装状态   Freebuff 已更新或 app.asar 被改动，补丁已不在原位：请重新安装' -ForegroundColor Yellow
    }
    if ($driftProblems.Count -gt 0) { Write-Host ('  具体问题   ' + ($driftProblems -join '；')) -ForegroundColor Red }
    Write-Host "  上次安装   $($manifest.installedAt)（备份仍可用于还原，但版本已变时不要用它覆盖）"
    Write-Host ''
    return
  }
  if (-not $verify -or -not $verify.ok) {
    $problems = @($verify.problems) | Where-Object { $_ }
    Write-Host ('  安装状态   已安装，但有个别文件与安装记录不一致' + $(if ($problems.Count -gt 0) { '：' + ($problems -join '；') } else { '' })) -ForegroundColor Yellow
  } else {
    Write-Host '  安装状态   已安装' -ForegroundColor Green
  }
  Write-Host "  安装时间   $($manifest.installedAt)"
  Write-Host "  备份目录   $($manifest.backupDir)"
  if ($verify) {
    if ($verify.ok) {
      Write-Host '  自检结论   通过（界面标记、原生文案锚点、三份脚本哈希都一致）' -ForegroundColor Green
    } else {
      $problems = @($verify.problems) | Where-Object { $_ }
      Write-Host ('  自检结论   未通过：' + ($problems -join '；') + '——重跑「安装.cmd」通常就能修好') -ForegroundColor Red
    }
  } else {
    Write-Host '  自检结论   未能运行自检（检查 Node.js 与安装目录）' -ForegroundColor Yellow
  }
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
  if (-not (Test-Path $MetaPath)) { Fail "找不到构建信息：$MetaPath（先运行 npm run build）" }

  Assert-AppIdle

  $meta = Get-Content -LiteralPath $MetaPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $appVersion = Read-AppVersion
  if (-not $appVersion) {
    Fail "读不到 Freebuff 版本号（$asar 里的 package.json 没读到）：安装目录可能不完整，或 app.asar 被改过。请重装 Freebuff，或用 -AppDir 指定正确的目录。"
  }
  $supported = Get-SupportedVersions
  if ($supported.Count -gt 0 -and $supported -notcontains $appVersion -and -not $Force) {
    Fail "当前 Freebuff 版本 $appVersion 不在适配列表（$($supported -join ' / ')）里。装上新版 Freebuff 后请先更新本补丁；确要继续可加 -Force。"
  }
  Write-Step "应用版本 $appVersion，补丁版本 $($meta.version)"

  $existing = Read-Manifest
  $verifyNow = Get-PatchVerify
  $shellMarked = [bool]($verifyNow -and $verifyNow.shellMarkers -eq 1)
  $asarMarked = [bool]($verifyNow -and $verifyNow.hostedMarkers -eq 1)
  $alreadyPatched = $shellMarked -and $asarMarked

  # 界面里有 marker、却没有安装记录：既不能安全重打（没有原始备份），也没法刷新（不知道补丁版本）。
  if (-not $existing -and ($shellMarked -or $asarMarked)) {
    Fail '界面里已经打过补丁，但找不到安装记录（manifest.json）。请用 Freebuff 官方安装包重装 Freebuff（会覆盖回英文原版），再安装中文补丁。'
  }

  # 不是「两处都在」、或自检已经报问题（缺锚点、脚本丢了、文件被手改），一律走完整重打。
  $needsFullPatch = -not $alreadyPatched -or ($verifyNow -and -not $verifyNow.ok)
  if ($alreadyPatched -and $existing.patchVersion -ne $meta.version) { $needsFullPatch = $true }

  if ($needsFullPatch -and $existing -and ($shellMarked -or $asarMarked)) {
    # 先确认当前文件还是「我们上次装出来的那份」，否则用旧备份还原会把 Freebuff 降级回上一版。
    $asarNow = Get-Sha256 $asar
    $shellNow = Get-Sha256 $shell
    $drifted = ($asarNow -ne $existing.appAsar.patchedHash) -or ($shellNow -ne $existing.shell.patchedHash)
    if ($drifted -and -not $Force) {
      Fail ("app.asar/index.html 与安装记录不一致：Freebuff 可能已原地更新过，或上次安装被中途打断。" +
        '为了不用旧备份覆盖新版本，已中止。请先重装 Freebuff（官方安装包），再安装中文补丁；' +
        '确认这台机器上的 Freebuff 没有被更新过，可以加 -Force 继续。')
    }
    if ($drifted) { Write-Step '文件与安装记录不一致，按 -Force 用备份覆盖（风险自担）' }
    Write-Step "先还原再重打（补丁版本 $($existing.patchVersion) → $($meta.version)）"
    $null = Invoke-Patcher 'restore' @('--backup', $existing.backupDir)
    $alreadyPatched = $false
  }

  if ($alreadyPatched) {
    Write-Step '检测到已安装，只更新词表与脚本'
    $refresh = (Invoke-Patcher 'refresh' @('--asset', $AssetPath)) | ConvertFrom-Json
    $existing.patchVersion = $meta.version
    $existing.entries = $meta.entries
    $existing.rules = $meta.rules
    $existing.asset.hash = $refresh.hosted
    $existing.asset | Add-Member -NotePropertyName mainHash -NotePropertyValue $refresh.main -Force
    $existing | Add-Member -NotePropertyName refreshedAt -NotePropertyValue ((Get-Date).ToString('s')) -Force
    Write-Manifest $existing
    $verify = Get-PatchVerify
    if (-not $verify -or -not $verify.ok) { Fail ('安装校验未通过：' + ($(if ($verify) { $verify.problems -join '；' } else { '自检没有返回结果' }))) }
    Write-Host ''
    Write-Host '✓ 词表已更新' -ForegroundColor Green
    Write-Host '  重新打开 Freebuff 生效。'
    Write-Host ''
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
      name     = 'freebuff-zh-cn.js'
      path     = (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-cn.js')
      hash     = $result.assetHash
      mainPath = (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-main.js')
      mainHash = $result.mainHash
    }
    entries          = $meta.entries
    rules            = $meta.rules
  }
  Write-Manifest $manifest

  $verify = Get-PatchVerify
  if (-not $verify -or -not $verify.ok) { Fail ('安装校验未通过：' + ($(if ($verify) { $verify.problems -join '；' } else { '自检没有返回结果' }))) }

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
  $shell = Join-Path $dir 'resources\orchestrator\ui\index.html'
  if (-not (Test-Path $asar)) { Fail "找不到 app.asar：$asar" }
  if (-not (Test-Path (Join-Path $manifest.backupDir 'app.asar'))) { Fail "找不到备份：$($manifest.backupDir)。请用 Freebuff 官方安装包重装。" }
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
  if ((Test-Path $shell) -and $result.restoredIndexHash -ne $manifest.shell.originalHash) {
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
  $verify = Get-PatchVerify
  if (-not $verify) { Fail '自检没有返回结果：请确认 Node.js 可用、Freebuff 装在默认目录。' }
  Write-Host ''
  Write-Host 'Freebuff 中文补丁 · 自检' -ForegroundColor Cyan
  Write-Host "  应用版本       $($verify.appVersion)"
  Write-Host "  界面入口标记   $($verify.shellMarkers)"
  Write-Host "  app.asar 标记  $($verify.hostedMarkers)"
  Write-Host "  原生文案锚点   $($verify.anchors) 处"
  Write-Host "  译文缺失       $($verify.missing) 处"
  Write-Host "  原文残留       $($verify.residual) 处"
  $manifest = Read-Manifest
  if ($manifest) {
    $dir = Resolve-AppDir
    $scripts = @(
      [ordered]@{ label = '汉化脚本(外挂)';   path = (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-cn.js'); hash = $manifest.asset.hash },
      [ordered]@{ label = '汉化脚本(界面壳)'; path = (Join-Path $dir 'resources\orchestrator\ui\freebuff-zh-cn.js'); hash = $manifest.asset.hash }
    )
    $mainHash = $null
    if ($manifest.asset.PSObject.Properties['mainHash']) { $mainHash = $manifest.asset.mainHash }
    if ($mainHash) {
      $scripts += [ordered]@{ label = '主世界脚本'; path = (Join-Path $dir 'resources\freebuff-zh\freebuff-zh-main.js'); hash = $mainHash }
    }
    foreach ($script in $scripts) {
      if (-not (Test-Path $script.path)) {
        Write-Host "  $($script.label)   缺失"
        $verify.ok = $false
        $verify.problems = @($verify.problems) + "缺少 $($script.label)"
        continue
      }
      $ok = (Get-Sha256 $script.path) -eq $script.hash
      Write-Host ("  $($script.label)" + (' ' * [Math]::Max(1, 15 - $script.label.Length)) + $(if ($ok) { '与安装记录一致' } else { '与安装记录不一致（重跑安装即可同步）' }))
      if (-not $ok) {
        $verify.ok = $false
        $verify.problems = @($verify.problems) + "$($script.label)与安装记录不一致"
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
