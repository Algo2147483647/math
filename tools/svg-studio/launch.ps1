param([switch]$Preview)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

# Prefer the user's Node installation, with the desktop runtime as an optional fallback.
$studioNodeCandidates = @(
    (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
    (Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
)
$studioNode = $null
foreach ($candidate in $studioNodeCandidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
        $version = & $candidate -p 'process.versions.node'
        if ([version]$version -ge [version]'22.12.0') { $studioNode = $candidate; break }
    }
}
if (-not $studioNode) { throw 'Install Node.js 22.12 or later, then run this launcher again.' }
$env:Path = "$(Split-Path -Parent $studioNode);$env:Path"

if (-not (Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) {
    $studioNpm = Get-Command npm.cmd -ErrorAction Stop
    $studioNpmCli = Join-Path (Split-Path -Parent $studioNpm.Source) 'node_modules/npm/bin/npm-cli.js'
    if (Test-Path -LiteralPath $studioNpmCli) { & $studioNode $studioNpmCli ci }
    else { & $studioNpm.Source ci }
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
Write-Host 'Vectora: http://127.0.0.1:4173/ (Ctrl+C to stop)'
if ($Preview) {
    & $studioNode node_modules/typescript/bin/tsc --noEmit
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $studioNode node_modules/vite/bin/vite.js build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $studioNode node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173
} else {
    & $studioNode node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173
}
