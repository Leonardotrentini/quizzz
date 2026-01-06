@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   DEPLOY VITALITYFLOW - VERCEL
echo ═══════════════════════════════════════════════════════════
echo.

echo Verificando se está logado no Vercel...
vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Você precisa fazer login no Vercel primeiro!
    echo.
    echo Execute: vercel login
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Logado no Vercel!
echo.
echo Fazendo deploy para produção...
echo.

vercel --prod --yes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deploy concluído com sucesso!
    echo.
) else (
    echo.
    echo ❌ Erro no deploy!
    echo.
    pause
)


