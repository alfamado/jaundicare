# function Show-Tree {
#     param([string]$Path = ".", [int]$MaxDepth = 3, [string]$Indent = "")
#     if ($MaxDepth -lt 0) { return }
#     Get-ChildItem -Path $Path | Where-Object { $_.Name -notmatch '^(node_modules|venv|\.git|\.expo|dist|build|package-lock\.json|yarn\.lock)$' } | ForEach-Object {
#         Write-Output "$Indent+-- $($_.Name)"
#         if ($_.PSIsContainer) {
#             Show-Tree -Path $_.FullName -MaxDepth ($MaxDepth - 1) -Indent "$Indent|  "
#         }
#     }
# }
# Show-Tree

# run in powershell to get a tree view of the project structure, excluding certain directories and files.