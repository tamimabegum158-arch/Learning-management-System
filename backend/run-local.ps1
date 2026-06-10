param(
    [string]$Profile = 'test',
    [string]$Port = '8080'
)

function Get-CurrentJavaVersion {
    $output = & java -version 2>&1
    foreach ($line in $output) {
        if ($line -match 'version\s+"([0-9]+)') {
            return [int]$matches[1]
        }
    }
    return $null
}

function Get-CurrentJavaHome {
    $output = & java -XshowSettings:properties -version 2>&1
    foreach ($line in $output) {
        if ($line -match '^\s*java.home = (.+)$') {
            return $matches[1]
        }
    }
    return $null
}

$javaVersion = Get-CurrentJavaVersion
$javaHomeFromJava = Get-CurrentJavaHome

if (-not $javaVersion) {
    Write-Error 'Unable to detect java version. Install JDK 21 and ensure java is on PATH.'
    exit 1
}

if ($javaVersion -lt 21) {
    Write-Error "Java 21+ is required, found version $javaVersion. Set JAVA_HOME to a valid JDK 21 install and try again."
    exit 1
}

if ($javaHomeFromJava) {
    if (-not $env:JAVA_HOME -or $env:JAVA_HOME -ne $javaHomeFromJava) {
        Write-Host "Detected java.home from java executable: $javaHomeFromJava"
        Write-Host 'Overriding JAVA_HOME for this session.'
        $env:JAVA_HOME = $javaHomeFromJava
    }
}

$env:SPRING_PROFILES_ACTIVE = $Profile
$env:SERVER_PORT = $Port

Write-Host "Starting backend with profile '$Profile' on port $Port'..."
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "Using wrapper: $PSScriptRoot\\mvnw.cmd"

Push-Location $PSScriptRoot
try {
    & .\mvnw.cmd spring-boot:run
}
finally {
    Pop-Location
}
