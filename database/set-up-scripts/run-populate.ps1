# PowerShell script to run the populate-characters.js against the running MongoDB container

Write-Host "Populating MongoDB with initial character data..."
$scriptPath = $PSScriptRoot + "\populate-characters.js"
Get-Content $scriptPath | docker exec -i rogue-trader-vtt-mongodb-1 mongosh
Write-Host "Done!"