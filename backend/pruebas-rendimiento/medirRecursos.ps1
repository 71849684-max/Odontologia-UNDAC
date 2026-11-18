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
        $origenCpu = 'tiempo_proceso';
        $cpu = $null;
        if ($null -ne $proceso.CPU) {
            $cpu = if ($anterior -and $null -ne $anterior.Cpu) { 100 * ($proceso.CPU - $anterior.Cpu) / (($momento - $anterior.Momento).TotalSeconds * $procesadores) } else { 0 }
        } else {
            # Windows puede ocultar CPU a procesos del servicio MySQL. No convertirlo en cero.
            $origenCpu = 'contador_windows';
            $contadorProceso = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -Filter "IDProcess=$identificador" -ErrorAction SilentlyContinue;
            if ($contadorProceso -and $null -ne $contadorProceso.PercentProcessorTime) {
                $cpu = [double]$contadorProceso.PercentProcessorTime / $procesadores;
            }
        }
        $muestras.Add([pscustomobject]@{
            FechaUtc = $momento.ToUniversalTime().ToString('o')
            Proceso = $proceso.ProcessName
            Identificador = $identificador
            CpuPorcentajeEquipo = if ($null -ne $cpu) { [Math]::Round($cpu, 2) } else { $null }
            CpuDisponible = $null -ne $cpu
            OrigenCpu = $origenCpu
            MemoriaMb = [Math]::Round($proceso.WorkingSet64 / 1MB, 2)
            Hilos = $proceso.Threads.Count
        })
        $anteriores[$identificador] = @{ Cpu = $proceso.CPU; Momento = $momento }
    }
    Start-Sleep -Seconds 2
}
$muestras | Export-Csv -LiteralPath $Destino -NoTypeInformation -Encoding utf8
