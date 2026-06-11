param(
    [string]$EnvFile = "",
    [string]$JavaHome = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.1.1\jbr"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path "$PSScriptRoot\.."
$backend = Join-Path $root "backend"
$logs = Join-Path $root "logs"
$java = Join-Path $JavaHome "bin\java.exe"

if (!$EnvFile) {
    $defaultEnvFile = Join-Path $backend "supabase.env"
    $dotEnvFile = Join-Path $backend ".supabase.env"
    $EnvFile = if (Test-Path -LiteralPath $defaultEnvFile) { $defaultEnvFile } else { $dotEnvFile }
}

if (!(Test-Path -LiteralPath $java)) {
    throw "Java 21 not found at $java. Pass -JavaHome or set JAVA_HOME to a JDK 21 path."
}

if (!(Test-Path -LiteralPath $EnvFile)) {
    throw "Env file not found: $EnvFile. Create it from backend/supabase.env.example."
}

if (!(Test-Path -LiteralPath $logs)) {
    New-Item -ItemType Directory -Path $logs | Out-Null
}

$raw = @{}
foreach ($line in Get-Content -LiteralPath $EnvFile) {
    $trimmed = $line.Trim()
    if (!$trimmed -or $trimmed.StartsWith("#")) { continue }
    $parts = $trimmed.Split("=", 2)
    if ($parts.Count -ne 2) { continue }
    $raw[$parts[0].Trim()] = $parts[1].Trim()
}

function Resolve-EnvValue([string]$value, [hashtable]$values) {
    return [regex]::Replace($value, '\$\{([^}]+)\}', {
        param($match)
        $key = $match.Groups[1].Value
        if ($values.ContainsKey($key)) { return $values[$key] }
        return $match.Value
    })
}

foreach ($key in $raw.Keys) {
    [Environment]::SetEnvironmentVariable($key, (Resolve-EnvValue $raw[$key] $raw), "Process")
}

$services = @(
    @{ Name = "discovery-service"; Jar = "discovery-service\target\discovery-service.jar" },
    @{ Name = "auth-service"; Jar = "auth-service\target\auth-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "user-service"; Jar = "user-service\target\user-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "place-service"; Jar = "place-service\target\place-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "product-service"; Jar = "product-service\target\product-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "order-service"; Jar = "order-service\target\order-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "music-service"; Jar = "music-service\target\music-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "gateway-service"; Jar = "gateway-service\target\gateway-service.jar" }
)

foreach ($service in $services) {
    $jar = Join-Path $backend $service.Jar
    if (!(Test-Path -LiteralPath $jar)) {
        throw "Missing jar: $jar. Build backend first."
    }

    $stdout = Join-Path $logs "$($service.Name)-stdout.log"
    $stderr = Join-Path $logs "$($service.Name)-stderr.log"
    $process = Start-Process -FilePath $java -ArgumentList @("-jar", $jar) -WorkingDirectory $backend -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    "$($service.Name) PID=$($process.Id)"
    Start-Sleep -Seconds 8
}
