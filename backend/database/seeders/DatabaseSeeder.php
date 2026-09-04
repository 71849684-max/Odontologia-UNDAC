<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * El esquema clinico proviene de bd_clinica_undac.sql, no de migraciones.
     */
    public function run(): void
    {
        $this->call(SeederAdministrador::class);
    }
}
