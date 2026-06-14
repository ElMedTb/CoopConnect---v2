$ErrorActionPreference = 'Continue'
$Host.UI.RawUI.WindowTitle = 'CoopConnect Gateway :8090'
Set-Location -LiteralPath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\api-gateway'
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
'CoopConnect Gateway :8090' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
'Working directory: C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\api-gateway' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
mvn.cmd spring-boot:run -DskipTests 2>&1 | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
('Stopped: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-gateway-8090.log' -Append
Read-Host 'Service arrete. Appuyez sur Entree pour fermer cette fenetre'
