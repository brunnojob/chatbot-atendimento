const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const { processMessage } = require("./handlers/messageHandler")
const { MESSAGES } = require("./config/constants")
const { logIncomingMessage, logOutgoingMessage, logError, logInfo, logSuccess, logWarning } = require("./utils/logger")

/**
 * Função principal para inicializar o bot
 */
async function startBot() {
  // Configuração de autenticação multi-arquivo
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")

  try {
    // Criação da conexão com WhatsApp
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // Vamos usar nossa própria implementação
      logger: require("pino")({ level: "silent" }), // Silencia logs internos do Baileys
    })

    // Event listener para atualizações de conexão
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        logInfo("QR Code gerado. Escaneie com seu WhatsApp:")
        console.log("\n" + "=".repeat(50))
        qrcode.generate(qr, { small: true })
        console.log("=".repeat(50) + "\n")
        logWarning("Aguardando leitura do QR Code...")
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

        if (shouldReconnect) {
          logWarning("Conexão perdida. Tentando reconectar em 3 segundos...")
          setTimeout(() => {
            startBot()
          }, 3000)
        } else {
          logError("Conexão encerrada. Bot foi deslogado do WhatsApp.")
          process.exit(1)
        }
      } else if (connection === "open") {
        logSuccess("Bot conectado com sucesso!")
        logSuccess("Chatbot da Dra. Daine dos Reis está ONLINE!")
        console.log("\n" + "=".repeat(40))
        console.log("   BOT PRONTO PARA ATENDER!")
        console.log("=".repeat(40) + "\n")
      }
    })

    // Event listener para salvar credenciais
    sock.ev.on("creds.update", saveCreds)

    // Event listener para mensagens recebidas
    sock.ev.on("messages.upsert", async (m) => {
      const message = m.messages[0]

      // Ignora mensagens próprias e mensagens de status
      if (!message.message || message.key.fromMe || message.key.remoteJid === "status@broadcast") {
        return
      }

      try {
        // Extrai informações da mensagem
        const from = message.key.remoteJid
        const messageText = extractMessageText(message)
        const isGroup = from.endsWith("@g.us")

        // Ignora mensagens de grupos (opcional)
        if (isGroup) {
          logWarning(`Mensagem de grupo ignorada: ${from}`)
          return
        }

        // Log da mensagem recebida
        logIncomingMessage(from, messageText)

        // Processa a mensagem e gera resposta
        const response = processMessage(messageText, from)

        // Se não houver resposta (null), não envia nada
        if (response === null) {
          logInfo(`Mensagem ignorada (não reconhecida): ${messageText}`)
          return
        }

        // Simula digitação (opcional)
        await sock.sendPresenceUpdate("composing", from)
        await delay(1000) // Aguarda 1 segundo
        await sock.sendPresenceUpdate("paused", from)

        // Envia a resposta
        await sock.sendMessage(from, { text: response })

        // Log da mensagem enviada
        logOutgoingMessage(from, response)
      } catch (error) {
        logError(`Erro ao processar mensagem: ${error.message}`)

        // Envia mensagem de erro genérica apenas em casos críticos
        try {
          await sock.sendMessage(message.key.remoteJid, {
            text: "Desculpe, ocorreu um erro. Tente novamente em alguns instantes.",
          })
        } catch (sendError) {
          logError(`Erro ao enviar mensagem de erro: ${sendError.message}`)
        }
      }
    })
  } catch (error) {
    logError(`Erro ao inicializar bot: ${error.message}`)

    // Tenta reiniciar após 5 segundos
    setTimeout(() => {
      logInfo("Tentando reiniciar o bot...")
      startBot()
    }, 5000)
  }
}

/**
 * Extrai o texto da mensagem
 * @param {Object} message - Objeto da mensagem
 * @returns {string} Texto da mensagem
 */
function extractMessageText(message) {
  if (message.message.conversation) {
    return message.message.conversation
  }

  if (message.message.extendedTextMessage) {
    return message.message.extendedTextMessage.text
  }

  if (message.message.imageMessage && message.message.imageMessage.caption) {
    return message.message.imageMessage.caption
  }

  if (message.message.videoMessage && message.message.videoMessage.caption) {
    return message.message.videoMessage.caption
  }

  return ""
}

/**
 * Função para criar delay
 * @param {number} ms - Milissegundos para aguardar
 * @returns {Promise} Promise que resolve após o delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  logError(`Erro não capturado: ${error.message}`)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logError(`Promise rejeitada: ${reason}`)
})

// Banner de inicialização
console.clear()
console.log("\n" + "=".repeat(60))
console.log("CHATBOT WHATSAPP - Brunno Silveira")
console.log("=".repeat(60))
console.log("Versão: 1.0.0")
console.log("Iniciando sistema...")
console.log("=".repeat(60) + "\n")

// Inicia o bot
startBot()
