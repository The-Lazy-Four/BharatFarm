Add-Type -AssemblyName System.Drawing

$srcPath = "client/public/icons/icon-512.png"

$targets = @(
    @{ path = "client/public/icons/icon-32.png"; size = 32 },
    @{ path = "client/public/icons/icon-96.png"; size = 96 },
    @{ path = "client/public/icons/icon-144.png"; size = 144 },
    @{ path = "client/public/icons/icon-192.png"; size = 192 },
    @{ path = "client/public/icons/icon-384.png"; size = 384 },
    @{ path = "client/public/icons/icon-192-maskable.png"; size = 192 },
    @{ path = "client/public/icons/icon-512-maskable.png"; size = 512 },
    @{ path = "client/public/icons/apple-touch-icon.png"; size = 180 },
    @{ path = "client/public/favicon.png"; size = 256 },
    @{ path = "client/public/favicon-16.png"; size = 16 },
    @{ path = "client/public/logo.png"; size = 512 }
)

foreach ($t in $targets) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap($t.size, $t.size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $t.size, $t.size)
    $src.Dispose()
    $g.Dispose()
    $bmp.Save($t.path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Resized $($t.path) to $($t.size)x$($t.size)"
}
