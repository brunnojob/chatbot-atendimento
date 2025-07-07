
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}


function getTimestamp() {
  const now = new Date()
  return now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}


function logIncomingMessage(from, message) {
  const timestamp = getTimestamp()
  const phoneNumber = from.replace("@s.whatsapp.net", "")
  console.log(
    `${colors.cyan}[${timestamp}] RECEBIDA${colors.reset} de ${colors.bright}${phoneNumber}${colors.reset}: ${message}`,
  )
}


function logOutgoingMessage(to, message) {
  const timestamp = getTimestamp()
  const phoneNumber = to.replace("@s.whatsapp.net", "")
  const shortMessage = message.length > 50 ? message.substring(0, 50) + "..." : message
  console.log(
    `${colors.green}[${timestamp}] ENVIADA${colors.reset} para ${colors.bright}${phoneNumber}${colors.reset}: ${shortMessage}`,
  )
}


function logError(error) {
  const timestamp = getTimestamp()
  console.log(`${colors.red}[${timestamp}] ERRO${colors.reset}: ${error}`)
}


function logInfo(message) {
  const timestamp = getTimestamp()
  console.log(`${colors.blue}[${timestamp}] INFO${colors.reset}: ${message}`)
}


function logSuccess(message) {
  const timestamp = getTimestamp()
  console.log(`${colors.green}[${timestamp}] SUCESSO${colors.reset}: ${message}`)
}


function logWarning(message) {
  const timestamp = getTimestamp()
  console.log(`${colors.yellow}[${timestamp}] AVISO${colors.reset}: ${message}`)
}

module.exports = {
  logIncomingMessage,
  logOutgoingMessage,
  logError,
  logInfo,
  logSuccess,
  logWarning,
}
