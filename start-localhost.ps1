param(
  [int]$Port = 8765,
  [string]$AppFile = "index.html",
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PublicRoot = Join-Path $Root "public"
$AppPath = Join-Path $PublicRoot $AppFile

if (-not (Test-Path -LiteralPath $AppPath -PathType Leaf)) {
  Write-Host "Application file not found: $AppPath" -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

function Get-ContentType {
  param([string]$Path)

  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8"; break }
    ".htm"  { "text/html; charset=utf-8"; break }
    ".css"  { "text/css; charset=utf-8"; break }
    ".js"   { "application/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".svg"  { "image/svg+xml"; break }
    ".png"  { "image/png"; break }
    ".jpg"  { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".gif"  { "image/gif"; break }
    ".ico"  { "image/x-icon"; break }
    default { "application/octet-stream"; break }
  }
}

function Send-Text {
  param(
    [System.Net.HttpListenerResponse]$Response,
    [int]$StatusCode,
    [string]$Text
  )

  $bytes = [Text.Encoding]::UTF8.GetBytes($Text)
  $Response.StatusCode = $StatusCode
  $Response.ContentType = "text/plain; charset=utf-8"
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

try {
  $listener.Start()
} catch {
  Write-Host "Could not start localhost server on $prefix" -ForegroundColor Red
  Write-Host "Most likely the port is already busy. Close the other server or start this script with another port and update the HTML redirect port too." -ForegroundColor Yellow
  Write-Host $_.Exception.Message -ForegroundColor DarkGray
  Read-Host "Press Enter to close"
  exit 1
}

$encodedAppFile = [Uri]::EscapeDataString($AppFile)
$appUrl = "http://localhost:$Port/$encodedAppFile"

Write-Host ""
Write-Host "PrintVisual localhost server is running:" -ForegroundColor Green
Write-Host "  $appUrl"
Write-Host ""
Write-Host "Keep this window open while using the app. Press Q or Ctrl+C to stop."
Write-Host ""

if (-not $NoBrowser) {
  Start-Process $appUrl
}

try {
  $pendingContext = $listener.GetContextAsync()

  while ($listener.IsListening) {
    try {
      if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if ($key.Key -eq "Q") {
          break
        }
      }
    } catch {
      # Some hosts do not expose interactive keyboard state.
    }

    if (-not $pendingContext.Wait(200)) {
      continue
    }

    $context = $pendingContext.Result
    $pendingContext = $listener.GetContextAsync()
    $request = $context.Request
    $response = $context.Response

    try {
      if ($request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 204
        $response.Close()
        continue
      }

      $relativePath = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = $AppFile
      }

      $relativePath = $relativePath -replace "/", [IO.Path]::DirectorySeparatorChar
      $candidatePath = Join-Path $PublicRoot $relativePath
      $resolvedPath = [IO.Path]::GetFullPath($candidatePath)
      $resolvedRoot = [IO.Path]::GetFullPath($PublicRoot)
      $resolvedRootWithSlash = $resolvedRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar

      if (-not $resolvedPath.StartsWith($resolvedRootWithSlash, [StringComparison]::OrdinalIgnoreCase)) {
        Send-Text $response 403 "Forbidden"
        $response.Close()
        continue
      }

      if (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
        Send-Text $response 404 "Not found"
        $response.Close()
        continue
      }

      $bytes = [IO.File]::ReadAllBytes($resolvedPath)
      $response.StatusCode = 200
      $response.ContentType = Get-ContentType $resolvedPath
      $response.Headers["Cache-Control"] = "no-store"
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
    } catch {
      try {
        Send-Text $response 500 $_.Exception.Message
        $response.Close()
      } catch {
        # The browser may have closed the connection.
      }
    }
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
