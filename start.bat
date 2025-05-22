
@echo off
echo Iniciando o servidor de desenvolvimento...
cd /d "%~dp0"

REM Tentar executar com npx vite primeiro
echo Tentando executar com "npx vite"...
npx --yes vite

REM Se o npx vite falhar, tente com npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo A execução com npx vite falhou, tentando com "npm run dev"...
    npm run dev
    
    REM Se npm run dev também falhar, sugerir verificar package.json
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERRO: Falha ao iniciar o servidor de desenvolvimento.
        echo.
        echo Sugestão: Verifique se o package.json possui um script "dev" ou execute:
        echo npm run
        echo para ver os scripts disponíveis.
    )
)

pause
