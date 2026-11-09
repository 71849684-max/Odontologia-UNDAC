param(
    [Parameter(Mandatory = $true)][int[]]$ProcesosPhp,
    [Parameter(Mandatory = $true)][int]$ProcesoMysql,
    [int]$Segundos = 60,
    [string]$Destino = 'resultados/recursos.csv'
)
$procesadores = [Environment]::ProcessorCount
$seleccionados = @($ProcesosPhp) + @($ProcesoMysql)
$anteriores = @{}
$inicio = Get-Date
$muestras = [Collections.Generic.List[object]]::new()
while (((Get-Date) - $inicio).TotalSeconds -lt $Segundos) {
    $momento = Get-Date
    foreach ($identificador in $seleccionados) {
        $proceso = Get-Process -Id $identificador -ErrorAction SilentlyContinue
        if (-not $proceso) { continue }
        $anterior = $anteriores[$identificador]
        $cpu = if ($anterior) { 100 * ($proceso.CPU - $anterior.Cpu) / (($momento - $anterior.Momento).TotalSeconds * $procesadores) } else { 0 }
        $muestras.Add([pscustomobject]@{
            FechaUtc = $momento.ToUniversalTime().ToString('o')
            Proceso = $proceso.ProcessName
            Identificador = $identificador
            CpuPorcentajeEquipo = [Math]::Round($cpu, 2)
            MemoriaMb = [Math]::Round($proceso.WorkingSet64 / 1MB, 2)
            Hilos = $proceso.Threads.Count
        })
        $anteriores[$identificador] = @{ Cpu = $proceso.CPU; Momento = $momento }
    }
    Start-Sleep -Seconds 2
}
$muestras | Export-Csv -LiteralPath $Destino -NoTypeInformation -Encoding utf8
