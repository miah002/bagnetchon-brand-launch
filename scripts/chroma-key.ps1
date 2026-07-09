# scripts/chroma-key.ps1 -In <src> -Out <dest> -KeyHex "2B160A" -Tolerance 40 -Feather 25
# Cuts a solid background color to transparent (with feathered edge). Uses LockBits for speed.
param(
  [string]$In, [string]$Out,
  [string]$KeyHex = "2B160A",
  [int]$Tolerance = 40,
  [int]$Feather = 25
)
Add-Type -AssemblyName System.Drawing

$kr = [Convert]::ToInt32($KeyHex.Substring(0,2), 16)
$kg = [Convert]::ToInt32($KeyHex.Substring(2,2), 16)
$kb = [Convert]::ToInt32($KeyHex.Substring(4,2), 16)

$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path $In))
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose(); $img.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes = $data.Stride * $bmp.Height
$buf = New-Object byte[] $bytes
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)

for ($y = 0; $y -lt $bmp.Height; $y++) {
  $rowStart = $y * $data.Stride
  for ($x = 0; $x -lt $bmp.Width; $x++) {
    $i = $rowStart + $x * 4
    $b = $buf[$i]; $gg = $buf[$i+1]; $r = $buf[$i+2]
    $dist = [Math]::Sqrt([Math]::Pow($r - $kr, 2) + [Math]::Pow($gg - $kg, 2) + [Math]::Pow($b - $kb, 2))
    if ($dist -lt $Tolerance) {
      $buf[$i+3] = 0
    } elseif ($dist -lt ($Tolerance + $Feather)) {
      $t = ($dist - $Tolerance) / $Feather
      $buf[$i+3] = [byte]([Math]::Min(255, [Math]::Max(0, [int](255 * $t))))
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $data.Scan0, $bytes)
$bmp.UnlockBits($data)
$OutFull = Join-Path (Get-Location) $Out
$bmp.Save($OutFull, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"{0} -> {1} ({2:N0} KB)" -f $In, $Out, ((Get-Item $OutFull).Length / 1KB)
