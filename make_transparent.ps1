Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\nickt\New folder\apex-detailing\lotus-emira-purple.jpg"
$dstPath = "c:\Users\nickt\New folder\apex-detailing\lotus-emira-transparent.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$outBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = $width * $height * 4
$srcBuffer = New-Object byte[] $bytes
$dstBuffer = New-Object byte[] $bytes

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBuffer, 0, $bytes)

for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $srcBuffer[$i]
    $g = $srcBuffer[$i + 1]
    $r = $srcBuffer[$i + 2]

    # Check if white background
    if ($r -gt 242 -and $g -gt 242 -and $b -gt 242) {
        # Transparent
        $dstBuffer[$i] = 0
        $dstBuffer[$i + 1] = 0
        $dstBuffer[$i + 2] = 0
        $dstBuffer[$i + 3] = 0
    } elseif ($r -gt 215 -and $g -gt 215 -and $b -gt 215) {
        # Feather alpha for smooth edges and soft ground shadow
        $minVal = [Math]::Min($r, [Math]::Min($g, $b))
        $alpha = [int](255 * (242 - $minVal) / 27)
        if ($alpha -lt 0) { $alpha = 0 }
        if ($alpha -gt 255) { $alpha = 255 }
        
        $dstBuffer[$i] = $b
        $dstBuffer[$i + 1] = $g
        $dstBuffer[$i + 2] = $r
        $dstBuffer[$i + 3] = [byte]$alpha
    } else {
        # Car body and wheels
        $dstBuffer[$i] = $b
        $dstBuffer[$i + 1] = $g
        $dstBuffer[$i + 2] = $r
        $dstBuffer[$i + 3] = 255
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($dstBuffer, 0, $dstData.Scan0, $bytes)

$bmp.UnlockBits($srcData)
$outBmp.UnlockBits($dstData)
$bmp.Dispose()

$outBmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()

Write-Host "Successfully generated transparent PNG: $dstPath"
