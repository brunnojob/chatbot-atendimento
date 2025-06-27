@echo off
echo ========================================
echo  RESET DE AUTENTICACAO - WHATSAPP BOT
echo ========================================
echo.
echo Parando o bot...
taskkill /f /im node.exe 2>nul
echo.
echo Removendo dados de autenticacao...
if exist auth_info_baileys (
    rmdir /s /q auth_info_baileys
    echo Dados de autenticacao removidos!
) else (
    echo Nenhum dado de autenticacao encontrado.
)
echo.
echo Reiniciando o bot...
echo Aguarde o QR Code aparecer e escaneie com seu WhatsApp.
echo.
pause
npm start
