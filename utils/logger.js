// Sistema de logs simplificado e robusto
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

/**
 * Formata timestamp atual
 * @returns {string} Timestamp formatado
 */
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

/**
 * Log de mensagem recebida
 * @param {string} from - Número do remetente
 * @param {string} message - Mensagem recebida
 */
function logIncomingMessage(from, message) {
  const timestamp = getTimestamp()
  const phoneNumber = from.replace("@s.whatsapp.net", "")
  console.log(
    `${colors.cyan}[${timestamp}] RECEBIDA${colors.reset} de ${colors.bright}${phoneNumber}${colors.reset}: ${message}`,
  )
}

/**
 * Log de mensagem enviada
 * @param {string} to - Número do destinatário
 * @param {string} message - Mensagem enviada
 */
function logOutgoingMessage(to, message) {
  const timestamp = getTimestamp()
  const phoneNumber = to.replace("@s.whatsapp.net", "")
  const shortMessage = message.length > 50 ? message.substring(0, 50) + "..." : message
  console.log(
    `${colors.green}[${timestamp}] ENVIADA${colors.reset} para ${colors.bright}${phoneNumber}${colors.reset}: ${shortMessage}`,
  )
}

/**
 * Log de erro
 * @param {string} error - Mensagem de erro
 */
function logError(error) {
  const timestamp = getTimestamp()
  console.log(`${colors.red}[${timestamp}] ERRO${colors.reset}: ${error}`)
}

/**
 * Log de informação geral
 * @param {string} message - Mensagem de informação
 */
function logInfo(message) {
  const timestamp = getTimestamp()
  console.log(`${colors.blue}[${timestamp}] INFO${colors.reset}: ${message}`)
}

/**
 * Log de sucesso
 * @param {string} message - Mensagem de sucesso
 */
function logSuccess(message) {
  const timestamp = getTimestamp()
  console.log(`${colors.green}[${timestamp}] SUCESSO${colors.reset}: ${message}`)
}

/**
 * Log de aviso
 * @param {string} message - Mensagem de aviso
 */
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
