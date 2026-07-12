param(
  [string]$OutputPath = (Join-Path $PSScriptRoot "..\build\icon.png")
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$size = 512
$bitmap = [System.Drawing.Bitmap]::new($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

try {
  $bounds = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
  $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $bounds,
    [System.Drawing.Color]::FromArgb(255, 91, 33, 182),
    [System.Drawing.Color]::FromArgb(255, 14, 165, 233),
    45
  )

  $background = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $radius = 92
  $diameter = $radius * 2
  $background.AddArc(8, 8, $diameter, $diameter, 180, 90)
  $background.AddArc($size - $diameter - 8, 8, $diameter, $diameter, 270, 90)
  $background.AddArc($size - $diameter - 8, $size - $diameter - 8, $diameter, $diameter, 0, 90)
  $background.AddArc(8, $size - $diameter - 8, $diameter, $diameter, 90, 90)
  $background.CloseFigure()
  $graphics.FillPath($gradient, $background)

  $panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(48, 255, 255, 255))
  $graphics.FillRectangle($panelBrush, 70, 78, 372, 250)

  $whitePen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 22)
  $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($whitePen, 132, 145, 380, 145)
  $graphics.DrawRectangle($whitePen, 125, 195, 262, 118)

  $lensBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 17, 24, 39))
  $graphics.FillEllipse($lensBrush, 278, 210, 82, 82)
  $highlightBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(225, 255, 255, 255))
  $graphics.FillEllipse($highlightBrush, 298, 230, 25, 25)

  $font = [System.Drawing.Font]::new("Segoe UI", 90, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $graphics.DrawString("PV", $font, $textBrush, [System.Drawing.RectangleF]::new(0, 342, $size, 130), $format)

  $outputDirectory = Split-Path -Parent $OutputPath
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Host "Generated application icon: $OutputPath"
