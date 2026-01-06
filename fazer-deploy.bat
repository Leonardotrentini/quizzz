@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   DEPLOY VITALITYFLOW - VERCEL
echo ═══════════════════════════════════════════════════════════
echo.

echo Verificando login no Vercel...
vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Você precisa fazer login no Vercel primeiro!
    echo.
    echo Vou abrir o processo de login agora...
    echo.
    echo 1. Uma janela do navegador será aberta
    echo 2. Faça login na sua conta Vercel
    echo 3. Autorize o acesso
    echo 4. Volte aqui e pressione ENTER quando concluir
    echo.
    pause
    echo.
    echo Iniciando login...
    vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Erro no login. Tente novamente.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Logado no Vercel!
echo.
echo Fazendo deploy para produção...
echo.

vercel --prod --yes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅✅✅ DEPLOY CONCLUÍDO COM SUCESSO! ✅✅✅
    echo.
    echo A página está no ar!
    echo.
) else (
    echo.
    echo ❌ Erro no deploy. Verifique as mensagens acima.
    echo.
    pause
)


