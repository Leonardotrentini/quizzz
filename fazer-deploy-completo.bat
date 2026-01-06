@echo off
echo ========================================
echo   DEPLOY VITALITYFLOW - VERCEL
echo ========================================
echo.

echo [1/3] Verificando autenticacao Vercel...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Nao esta autenticado na Vercel
    echo.
    echo Por favor, siga estes passos:
    echo 1. Execute: vercel login
    echo 2. Acesse o link que aparecer
    echo 3. Autorize o acesso
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Autenticado!
echo.

echo [2/3] Fazendo deploy...
vercel deploy --yes

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOY CONCLUIDO COM SUCESSO!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ ERRO NO DEPLOY
    echo ========================================
    echo.
)

pause

