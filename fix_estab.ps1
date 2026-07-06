$p = 'c:/github/pagina-web/public/establecimientos.html'
$b = [IO.File]::ReadAllBytes($p)
$t = [Text.Encoding]::UTF8.GetString($b)

$searchStr = 'src="img/Logotipo '
$idx = $t.IndexOf($searchStr)
$tagStart = $t.LastIndexOf('<img ', $idx)
$tagEnd = $t.IndexOf('>', $tagStart) + 1

$i_acute = [char]0x00ED
$o_acute = [char]0x00F3
$u_acute = [char]0x00FA

$fixedTag = '<img src="img/Logotipo Valpara' + $i_acute + 'so_bco.png" alt="Logo SLEP Valpara' + $i_acute + 'so - Servicio Local de Educaci' + $o_acute + 'n P' + $u_acute + 'blica">'

$t = $t.Substring(0, $tagStart) + $fixedTag + $t.Substring($tagEnd)
[IO.File]::WriteAllBytes($p, [Text.Encoding]::UTF8.GetBytes($t))
Write-Host 'Done'
