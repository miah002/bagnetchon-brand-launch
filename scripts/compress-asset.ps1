# scripts/compress-asset.ps1 -In <src> -Out <dest> -MaxPx 1024 -Quality 80
param([string]$In, [string]$Out, [int]$MaxPx = 1024, [int]$Quality = 80)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $In))
$scale = [Math]::Min(1.0, $MaxPx / [Math]::Max($img.Width, $img.Height))
$w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = "HighQualityBicubic"
$g.DrawImage($img, 0, 0, $w, $h); $g.Dispose(); $img.Dispose()
$OutFull = Join-Path (Get-Location) $Out
if ($Out -match "\.jpe?g$") {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $bmp.Save($OutFull, $codec, $p)
} else {
  $bmp.Save($OutFull, [System.Drawing.Imaging.ImageFormat]::Png)
}
$bmp.Dispose()
"{0} -> {1} ({2:N0} KB)" -f $In, $Out, ((Get-Item $OutFull).Length / 1KB)
