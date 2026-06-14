$ErrorActionPreference = 'Continue'
$Host.UI.RawUI.WindowTitle = 'CoopConnect Core :8082'
Set-Location -LiteralPath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\backend'
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
'CoopConnect Core :8082' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
'Working directory: C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\backend' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
$env:SPRING_PROFILES_ACTIVE='dev'; mvn.cmd spring-boot:run -DskipTests 2>&1 | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
('Stopped: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-core-8082.log' -Append
Read-Host 'Service arrete. Appuyez sur Entree pour fermer cette fenetre'
