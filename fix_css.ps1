$p = 'c:/github/pagina-web/public/css/custom.css'
$b = [IO.File]::ReadAllBytes($p)
$t = [Text.Encoding]::UTF8.GetString($b)
$n = [char]10

$t = $t.Replace(
    '.accesibilidad-bar {' + $n + '  background-color: #1B365D;' + $n + '  border-bottom: 1px solid rgba(255,255,255,0.1);' + $n + '  padding: 4px 0;' + $n + '  font-size: 0.78rem;' + $n + '}',
    '.accesibilidad-bar {' + $n + '  background-color: #1B365D;' + $n + '  border-bottom: 1px solid rgba(255,255,255,0.1);' + $n + '  padding: 10px 0;' + $n + '  font-size: 1rem;' + $n + '}'
)

$t = $t.Replace(
    '.accesibilidad-bar .container {' + $n + '  display: flex;' + $n + '  justify-content: flex-end;' + $n + '  align-items: center;' + $n + '  gap: 6px;' + $n + '}',
    '.accesibilidad-bar .container {' + $n + '  display: flex;' + $n + '  justify-content: flex-end;' + $n + '  align-items: center;' + $n + '  gap: 10px;' + $n + '}'
)

$t = $t.Replace(
    '.accesibilidad-label {' + $n + '  color: rgba(255,255,255,0.6);' + $n + '  font-size: 0.72rem;' + $n + '  margin-right: 4px;' + $n + '  letter-spacing: 0.5px;' + $n + '  text-transform: uppercase;' + $n + '}',
    '.accesibilidad-label {' + $n + '  color: rgba(255,255,255,0.9);' + $n + '  font-size: 0.95rem;' + $n + '  margin-right: 6px;' + $n + '  letter-spacing: 0.5px;' + $n + '  text-transform: uppercase;' + $n + '}'
)

$t = $t.Replace(
    '  width: 30px;' + $n + '  height: 26px;' + $n + '  font-size: 0.78rem;',
    '  width: 42px;' + $n + '  height: 38px;' + $n + '  font-size: 1rem;'
)

[IO.File]::WriteAllBytes($p, [Text.Encoding]::UTF8.GetBytes($t))
Write-Host 'Done'
