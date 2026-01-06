@echo off
cd /d "%~dp0"
echo Iniciando servidor na porta 8080...
echo.
start "Servidor HTTP" cmd /k "node servir-pagina.js"
timeout /t 3 /nobreak >nul
start http://localhost:8080
echo.
echo Servidor iniciado! A pagina deve abrir automaticamente no navegador.
echo Para parar o servidor, feche a janela do servidor.
pause




