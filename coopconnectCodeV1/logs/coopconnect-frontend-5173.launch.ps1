$ErrorActionPreference = 'Continue'
$Host.UI.RawUI.WindowTitle = 'CoopConnect Frontend :5173'
Set-Location -LiteralPath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\frontend'
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
'CoopConnect Frontend :5173' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
'Working directory: C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\frontend' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
'============================================================' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
npm.cmd run dev -- --host 0.0.0.0 --port 5173 2>&1 | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
'' | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
('Stopped: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath 'C:\Users\pc\.vscode\Documents\pulling CoopConnect code git\v2\projets-casablanca-Bendahou-Nyazi-Qejiou-Tabrani\coopconnectCodeV1\logs\coopconnect-frontend-5173.log' -Append
Read-Host 'Service arrete. Appuyez sur Entree pour fermer cette fenetre'
