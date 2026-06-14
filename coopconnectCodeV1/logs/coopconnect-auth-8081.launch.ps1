$ErrorActionPreference = 'Continue'
$Host.UI.RawUI.WindowTitle = 'CoopConnect Auth :8081'
Set-Location -LiteralPath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\auth-service'
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
'CoopConnect Auth :8081' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
'Working directory: C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\auth-service' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
$env:SPRING_PROFILES_ACTIVE='dev'; mvn.cmd spring-boot:run -DskipTests 2>&1 | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
('Stopped: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-auth-8081.log' -Append
Read-Host 'Service arrete. Appuyez sur Entree pour fermer cette fenetre'
