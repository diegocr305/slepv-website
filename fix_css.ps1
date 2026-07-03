$p = 'c:/github/pagina-web/public/css/custom.css'
$b = [IO.File]::ReadAllBytes($p)
$t = [Text.Encoding]::UTF8.GetString($b)

# Increase acc-icon size
$t = $t.Replace(
    '.acc-icon {' + [char]13 + [char]10 + '  font-size: 1rem;' + [char]13 + [char]10 + '  color: rgba(255,255,255,0.7);' + [char]13 + [char]10 + '}',
    '.acc-icon {' + [char]13 + [char]10 + '  font-size: 1.2rem;' + [char]13 + [char]10 + '  color: rgba(255,255,255,0.85);' + [char]13 + [char]10 + '}'
)

# Increase acc-btn size
$t = $t.Replace(
    '  width: 30px;' + [char]13 + [char]10 + [char]13 + [char]10 + '  height: 26px;' + [char]13 + [char]10 + '  font-size: 0.78rem;',
    '  width: 36px;' + [char]13 + [char]10 + [char]13 + [char]10 + '  height: 32px;' + [char]13 + [char]10 + '  font-size: 0.88rem;'
)

[IO.File]::WriteAllBytes($p, [Text.Encoding]::UTF8.GetBytes($t))
Write-Host 'Done'
