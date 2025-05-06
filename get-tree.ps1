function Get-Tree {
    param(
        [string]$Path = '.',
        [string]$Indent = '',
        [string[]]$Exclude = @('node_modules'),
        [bool]$IsRoot = $true
    )

    # Safely get the item (skip if path is invalid)
    try {
        $item = Get-Item -LiteralPath $Path -ErrorAction Stop
    }
    catch {
        Write-Warning "Skipping invalid path: $Path"
        return
    }

    # Output the root directory name only once
    if ($IsRoot) {
        "$($item.FullName)"
    }

    # Get child items (files and directories), exclude unwanted directories
    $childItems = Get-ChildItem -LiteralPath $Path -Force -ErrorAction SilentlyContinue | 
        Where-Object { 
            (-not $_.PSIsContainer) -or ($_.PSIsContainer -and $Exclude -notcontains $_.Name)
        } | 
        Sort-Object Name

    $count = $childItems.Count
    for ($i = 0; $i -lt $count; $i++) {
        $childItem = $childItems[$i]
        $isLast = ($i -eq $count - 1)

        # Use .NET char escape sequences for symbols
        $prefix = if ($isLast) { 
            [char]::ConvertFromUtf32(0x2514) + [char]::ConvertFromUtf32(0x2500) * 3 
        } else { 
            [char]::ConvertFromUtf32(0x251C) + [char]::ConvertFromUtf32(0x2500) * 3 
        }
        $nextIndent = if ($isLast) { 
            "    " 
        } else { 
            [char]::ConvertFromUtf32(0x2502) + "   " 
        }

        # Output the child item (file or directory)
        "$Indent$prefix$($childItem.Name)"

        # Recurse into directories (skip excluded ones)
        if ($childItem.PSIsContainer -and $Exclude -notcontains $childItem.Name) {
            Get-Tree -Path $childItem.FullName -Indent "$Indent$nextIndent" -Exclude $Exclude -IsRoot $false
        }
    }
}

# Run the script and save the output
Get-Tree -Exclude 'node_modules', '.venv', 'obj', 'bin', '.processed', '.out', '.in' > ./.out/directory_structure.txt