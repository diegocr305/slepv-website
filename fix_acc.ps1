$pages = @('index','noticias','conocenos','participacion','establecimientos','documentacion')
$base = 'c:\github\pagina-web\public\'

$newAcc = "<!-- BARRA ACCESIBILIDAD -->`n<div class=""accesibilidad-bar"">`n  <div class=""container"">`n    <img src=""img/accesibilidad/accessibility-user-interface.png"" alt=""Accesibilidad"" class=""acc-icon"">`n    <span class=""accesibilidad-label"">Accesibilidad</span>`n    <button class=""acc-btn"" id=""acc-contraste"" title=""Alto contraste""><i class=""fas fa-adjust""></i></button>`n    <button class=""acc-btn"" id=""acc-reducir"" title=""Reducir texto"">A-</button>`n    <button class=""acc-btn"" id=""acc-aumentar"" title=""Aumentar texto"">A+</button>`n  </div>`n</div>`n"

foreach ($p in $pages) {
    $file = $base + $p + '.html'
    $text = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

    $topStart = $text.IndexOf('<!-- TOP BAR -->')
    $accStart = $text.IndexOf('<!-- BARRA ACCESIBILIDAD -->')
    $accEnd   = $text.IndexOf('</div>', $accStart + 100) + 6

    if ($topStart -lt 0 -or $accStart -lt 0) { Write-Host "$p : markers not found"; continue }
    if ($topStart -gt $accStart) { Write-Host "$p : already correct"; continue }

    $accBlock    = $text.Substring($accStart, $accEnd - $accStart)
    $textWithout = $text.Substring(0, $accStart).TrimEnd() + "`n" + $text.Substring($accEnd).TrimStart("`n")
    $topStart2   = $textWithout.IndexOf('<!-- TOP BAR -->')
    $final       = $textWithout.Substring(0, $topStart2) + $newAcc + "`n" + $textWithout.Substring($topStart2)

    if ($final.IndexOf('js/main.js') -lt 0) {
        $final = $final.Replace('</body>', "<script src=""js/main.js""></script>`n</body>")
    }

    [System.IO.File]::WriteAllText($file, $final, [System.Text.Encoding]::UTF8)
    Write-Host "$p : OK"
}
