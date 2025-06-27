const fs = require("fs")
const path = require("path")

console.log("========================================")
console.log(" RESET DE AUTENTICACAO - WHATSAPP BOT")
console.log("========================================")
console.log()

// Caminho da pasta de autenticação
const authPath = path.join(__dirname, "auth_info_baileys")

try {
  // Verifica se a pasta existe
  if (fs.existsSync(authPath)) {
    // Remove a pasta recursivamente
    fs.rmSync(authPath, { recursive: true, force: true })
    console.log("Dados de autenticacao removidos com sucesso!")
  } else {
    console.log("Nenhum dado de autenticacao encontrado.")
  }

  console.log()
  console.log("Agora execute: npm start")
  console.log("Escaneie o novo QR Code com seu WhatsApp")
  console.log()
} catch (error) {
  console.error("Erro ao remover dados de autenticacao:", error.message)
  console.log()
  console.log('Tente remover manualmente a pasta "auth_info_baileys"')
}
