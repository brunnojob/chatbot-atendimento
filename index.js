const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const { processMessage } = require("./handlers/messageHandler")
const { MESSAGES } = require("./config/constants")
const { logIncomingMessage, logOutgoingMessage, logError, logInfo, logSuccess, logWarning } = require("./utils/logger")


  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")

  try {
  
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, 
      logger: require("pino")({ level: "silent" }), 
    })


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

  
    sock.ev.on("creds.update", saveCreds)

  
    sock.ev.on("messages.upsert", async (m) => {
      const message = m.messages[0]

      
      if (!message.message || message.key.fromMe || message.key.remoteJid === "status@broadcast") {
        return
      }

      try {
        
        const from = message.key.remoteJid
        const messageText = extractMessageText(message)
        const isGroup = from.endsWith("@g.us")

      
        if (isGroup) {
          logWarning(`Mensagem de grupo ignorada: ${from}`)
          return
        }

        
        logIncomingMessage(from, messageText)

       
        const response = processMessage(messageText, from)


        if (response === null) {
          logInfo(`Mensagem ignorada (não reconhecida): ${messageText}`)
          return
        }

      
        await sock.sendPresenceUpdate("composing", from)
        await delay(1000) // Aguarda 1 segundo
        await sock.sendPresenceUpdate("paused", from)

        await sock.sendMessage(from, { text: response })

      
        logOutgoingMessage(from, response)
      } catch (error) {
        logError(`Erro ao processar mensagem: ${error.message}`)

       
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

 
    setTimeout(() => {
      logInfo("Tentando reiniciar o bot...")
      startBot()
    }, 5000)
  }
}

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


function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


process.on("uncaughtException", (error) => {
  logError(`Erro não capturado: ${error.message}`)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logError(`Promise rejeitada: ${reason}`)
})


console.clear()
console.log("\n" + "=".repeat(60))
console.log("CHATBOT WHATSAPP - Brunno Silveira")
console.log("=".repeat(60))
console.log("Versão: 1.0.0")
console.log("Iniciando sistema...")
console.log("=".repeat(60) + "\n")


startBot()
