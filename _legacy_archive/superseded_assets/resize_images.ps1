Add-Type -AssemblyName System.Drawing

$baseDir = $PSScriptRoot
$pngFiles = Get-ChildItem -Path $baseDir -Filter "*.png" | Where-Object { $_.Name -notlike "temp_*" }

foreach ($f in $pngFiles) {
    Write-Output "Processing $($f.FullName)..."
    $srcImg = [System.Drawing.Image]::FromFile($f.FullName)
    $targetWidth = 2500
    $targetHeight = 1686
    
    $destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcImg, 0, 0, $targetWidth, $targetHeight)
    $graphics.Dispose()
    $srcImg.Dispose()
    
    # Save as compressed JPEG at 2500x1686 (around 350KB - 500KB)
    $outJpeg = [System.IO.Path]::ChangeExtension($f.FullName, ".jpg")
    $encoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 85L)
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    
    $destBmp.Save($outJpeg, $jpegCodec, $encoderParams)
    $destBmp.Dispose()
    
    $sz = (Get-Item $outJpeg).Length
    Write-Output "Generated $outJpeg ($([math]::Round($sz / 1KB, 1)) KB)"
}
