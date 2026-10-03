Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\nickt\New folder\apex-detailing\results-ppf-after.jpg"
$dstPath = "c:\Users\nickt\New folder\apex-detailing\results-ppf-before.jpg"

$bmp = New-Object System.Drawing.Bitmap($srcPath)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$rand = New-Object System.Random(101)

# Noticeable rock chips and highway road rash
for ($i = 0; $i -lt 350; $i++) {
    $x = $rand.Next(240, 1200)
    $y = $rand.Next(390, 725)
    
    $col = $bmp.GetPixel($x, $y)
    # Check if purple paint
    if ($col.R -gt 40 -and $col.B -gt 50 -and $col.G -lt 120) {
        $chipType = $rand.Next(1, 10)
        
        if ($chipType -le 3) {
            # Large obvious stone chip (3-5px)
            $w = $rand.Next(3, 6)
            $h = $rand.Next(2, 5)
            $primer = [System.Drawing.Color]::FromArgb(235, 230, 230, 235)
            $brush = New-Object System.Drawing.SolidBrush($primer)
            $g.FillEllipse($brush, $x, $y, $w, $h)
            $brush.Dispose()
            
            # Dark impact pit ring
            $pitPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 20, 10, 30), 1)
            $g.DrawArc($pitPen, $x - 1, $y, $w + 1, $h + 1, 45, 180)
            $pitPen.Dispose()
        } elseif ($chipType -le 7) {
            # Medium chip (2-3px)
            $w = $rand.Next(2, 4)
            $h = $rand.Next(2, 4)
            $primer = [System.Drawing.Color]::FromArgb(220, 215, 215, 220)
            $brush = New-Object System.Drawing.SolidBrush($primer)
            $g.FillEllipse($brush, $x, $y, $w, $h)
            $brush.Dispose()
        } else {
            # Sharp fleck
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(240, 240, 240))
            $bmp.SetPixel($x+1, $y, [System.Drawing.Color]::FromArgb(220, 220, 220))
        }
    }
}

# Sandblast spray across lower lip and bumper edges
for ($j = 0; $j -lt 1200; $j++) {
    $x = $rand.Next(250, 1180)
    $y = $rand.Next(420, 720)
    $col = $bmp.GetPixel($x, $y)
    if ($col.R -gt 40 -and $col.B -gt 50 -and $col.G -lt 120) {
        $v = $rand.Next(190, 255)
        $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(200, $v, $v, $v))
    }
}

# Save as high quality JPEG
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 95L)

$g.Dispose()
$bmp.Save($dstPath, $encoder, $encoderParams)
$bmp.Dispose()
Write-Output "Enhanced results-ppf-before.jpg successfully!"
