@echo off
title Iniciando Sistema de Ventas DCH

echo ==============================================
echo Iniciando Backend...
echo ==============================================
start "Backend - Ventas DCH" /min cmd /c "cd /d "%~dp0backend" && node server.js"

echo ==============================================
echo Iniciando Frontend...
echo ==============================================
start "Frontend - Ventas DCH" /min cmd /c "cd /d "%~dp0" && npm run dev"

echo.
echo Los servicios se estan ejecutando en segundo plano (minimizados).
echo Puedes cerrar esta ventana.
timeout /t 5 > nul
exit
