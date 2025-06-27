#!/bin/bash
echo "========================================"
echo " RESET DE AUTENTICACAO - WHATSAPP BOT"
echo "========================================"
echo
echo "Parando o bot..."
pkill -f "node index.js" 2>/dev/null
echo
echo "Removendo dados de autenticacao..."
if [ -d "auth_info_baileys" ]; then
    rm -rf auth_info_baileys
    echo "Dados de autenticacao removidos!"
else
    echo "Nenhum dado de autenticacao encontrado."
fi
echo
echo "Reiniciando o bot..."
echo "Aguarde o QR Code aparecer e escaneie com seu WhatsApp."
echo
read -p "Pressione Enter para continuar..."
npm start
