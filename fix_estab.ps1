$p = 'c:/github/pagina-web/public/establecimientos.html'
$b = [IO.File]::ReadAllBytes($p)
$t = [Text.Encoding]::UTF8.GetString($b)

# Find the broken img tag by searching for the unique part without special chars
$searchStr = 'src=img/Logotipo '
$idx = $t.IndexOf($searchStr)
Write-Host "Found at: $idx"

if ($idx -ge 0) {
    # Find start of the tag (go back to find the space before src=)
    $tagStart = $t.LastIndexOf(' <img ', $idx)
    Write-Host "Tag start: $tagStart"
    
    # Find end of the tag (closing >)
    $tagEnd = $t.IndexOf('>', $idx) + 1
    Write-Host "Tag end: $tagEnd"
    
    $brokenTag = $t.Substring($tagStart, $tagEnd - $tagStart)
    Write-Host "Broken: [$brokenTag]"
    
    $fixedTag = '        <img src="img/Logotipo Valparaíso_bco.png" alt="Logo SLEP Valparaíso - Servicio Local de Educación Pública">'
    
    $t = $t.Substring(0, $tagStart) + $fixedTag + $t.Substring($tagEnd)
    [IO.File]::WriteAllBytes($p, [Text.Encoding]::UTF8.GetBytes($t))
    Write-Host 'Fixed and saved'
} else {
    Write-Host 'Pattern not found'
}
