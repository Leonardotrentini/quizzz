@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   TESTE DE PERFORMANCE - VITALITYFLOW
echo ═══════════════════════════════════════════════════════════
echo.
echo Verificando se o servidor está rodando...
echo.

node testar-performance.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Erro ao executar o teste!
    echo.
    echo Certifique-se de que:
    echo   1. O servidor está rodando (node servir-pagina.js)
    echo   2. Node.js está instalado
    echo.
    pause
)


