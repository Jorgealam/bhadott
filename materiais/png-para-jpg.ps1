# Converte os PNG de uma pasta em JPEG (qualidade 80) e apaga os PNG.
param([string]$Pasta)
Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$p = New-Object System.Drawing.Imaging.EncoderParameters 1
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 80L
Get-ChildItem $Pasta -Filter *.png | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $img.Save([System.IO.Path]::ChangeExtension($_.FullName, ".jpg"), $codec, $p); $img.Dispose()
  Remove-Item $_.FullName
}
