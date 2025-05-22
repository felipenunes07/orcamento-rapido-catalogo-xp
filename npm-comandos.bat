@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

:menu
cls
echo ===================================
echo   GERENCIADOR DE COMANDOS NPM
echo ===================================
echo.
echo  1. Iniciar servidor de desenvolvimento
echo  2. Construir projeto (build)
echo  3. Visualizar versao de producao
echo  4. Sair
echo.
echo ===================================

set /p opcao=Escolha uma opcao: 

if "%opcao%"=="1" goto iniciar
if "%opcao%"=="2" goto construir
if "%opcao%"=="3" goto visualizar
if "%opcao%"=="4" goto sair

echo.
echo Opcao invalida! Tente novamente.
echo.
pause
goto menu

:iniciar
cls
echo Iniciando o servidor de desenvolvimento...
echo.
npx --yes vite
pause
goto menu

:construir
cls
echo Construindo o projeto...
echo.
npx --yes vite build
pause
goto menu

:visualizar
cls
echo Visualizando a versao de producao...
echo.
npx --yes vite preview
pause
goto menu

:sair
exit