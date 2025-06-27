const { MESSAGES, STATES, MENU_COMMANDS, INACTIVITY_TIME, SUSPENSION_TIME } = require("../config/constants")

// Armazena o estado de cada usuário
const userStates = new Map()

// Armazena os timeouts de suspensão para cada usuário
const suspensionTimeouts = new Map()

// Armazena os timeouts de inatividade para cada usuário
const inactivityTimeouts = new Map()

// Armazena o timestamp da última interação de cada usuário
const lastInteraction = new Map()

/**
 * Obtém o estado atual do usuário
 * @param {string} userId - ID do usuário
 * @returns {string} Estado atual
 */
function getUserState(userId) {
  return userStates.get(userId) || STATES.MAIN_MENU
}

/**
 * Define o estado do usuário
 * @param {string} userId - ID do usuário
 * @param {string} state - Novo estado
 */
function setUserState(userId, state) {
  userStates.set(userId, state)
}

/**
 * Atualiza o timestamp da última interação do usuário
 * @param {string} userId - ID do usuário
 */
function updateLastInteraction(userId) {
  lastInteraction.set(userId, Date.now())
}

/**
 * Verifica se é a primeira mensagem ou se passou tempo suficiente para mostrar menu
 * @param {string} userId - ID do usuário
 * @returns {boolean} True se deve mostrar o menu
 */
function shouldShowMenu(userId) {
  const currentState = getUserState(userId)
  const lastTime = lastInteraction.get(userId)
  const now = Date.now()

  // Se nunca interagiu antes, mostra o menu
  if (!lastTime) {
    return true
  }

  // Se passou mais de 10 minutos desde a última interação, mostra o menu
  if (now - lastTime > INACTIVITY_TIME) {
    return true
  }

  // Se está no estado MAIN_MENU (primeira vez ou após inatividade), mostra o menu
  if (currentState === STATES.MAIN_MENU) {
    return true
  }

  return false
}

/**
 * Verifica se a mensagem é um comando específico para voltar ao menu
 * @param {string} message - Mensagem do usuário
 * @returns {boolean} True se for comando de menu
 */
function isMenuCommand(message) {
  const normalizedMessage = message.toLowerCase().trim()
  return MENU_COMMANDS.includes(normalizedMessage)
}

/**
 * Configura timeout de inatividade para um usuário
 * @param {string} userId - ID do usuário
 */
function setInactivityTimeout(userId) {
  // Limpa timeout anterior se existir
  if (inactivityTimeouts.has(userId)) {
    clearTimeout(inactivityTimeouts.get(userId))
  }

  // Cria novo timeout para voltar ao menu após inatividade
  const timeout = setTimeout(() => {
    setUserState(userId, STATES.MAIN_MENU)
    inactivityTimeouts.delete(userId)
    console.log(`Usuário ${userId.replace("@s.whatsapp.net", "")} voltou ao estado inicial por inatividade`)
  }, INACTIVITY_TIME)

  inactivityTimeouts.set(userId, timeout)
}

/**
 * Suspende o bot para um usuário específico por 10 minutos
 * @param {string} userId - ID do usuário
 */
function suspendBotForUser(userId) {
  // Define o estado como suspenso
  setUserState(userId, STATES.SUSPENDED)

  // Limpa timeouts de inatividade
  if (inactivityTimeouts.has(userId)) {
    clearTimeout(inactivityTimeouts.get(userId))
    inactivityTimeouts.delete(userId)
  }

  // Limpa timeout anterior de suspensão se existir
  if (suspensionTimeouts.has(userId)) {
    clearTimeout(suspensionTimeouts.get(userId))
  }

  // Cria novo timeout para reativar o bot após 10 minutos
  const timeout = setTimeout(() => {
    setUserState(userId, STATES.MAIN_MENU)
    suspensionTimeouts.delete(userId)
    console.log(`Bot reativado para usuário: ${userId.replace("@s.whatsapp.net", "")}`)
  }, SUSPENSION_TIME)

  suspensionTimeouts.set(userId, timeout)

  console.log(`Bot suspenso por 10 minutos para usuário: ${userId.replace("@s.whatsapp.net", "")}`)
}

/**
 * Processa mensagens do menu principal
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 * @returns {string|null} Resposta do bot ou null se não houver resposta
 */
function handleMainMenu(message, userId) {
  const option = message.trim()

  switch (option) {
    case "1":
      setUserState(userId, STATES.ACTIVE_CONVERSATION)
      setInactivityTimeout(userId)
      return MESSAGES.CONSULTATION_DETAILS

    case "2":
      // Suspende o bot e retorna mensagem de atendimento humano
      suspendBotForUser(userId)
      return MESSAGES.HUMAN_ATTENDANT

    case "3":
      setUserState(userId, STATES.ACTIVE_CONVERSATION)
      setInactivityTimeout(userId)
      return MESSAGES.GROUP_LINK

    default:
      // Não retorna mensagem de erro, apenas ignora
      return null
  }
}

/**
 * Processa mensagens durante conversa ativa
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 * @returns {string|null} Resposta do bot ou null
 */
function handleActiveConversation(message, userId) {
  // Se for comando específico de menu, volta ao menu
  if (isMenuCommand(message)) {
    setUserState(userId, STATES.MAIN_MENU)
    // Limpa timeout de inatividade
    if (inactivityTimeouts.has(userId)) {
      clearTimeout(inactivityTimeouts.get(userId))
      inactivityTimeouts.delete(userId)
    }
    return MESSAGES.WELCOME
  }

  // Atualiza timeout de inatividade
  setInactivityTimeout(userId)

  // Para outras mensagens durante conversa ativa, não responde
  return null
}

/**
 * Processa mensagens quando o bot está suspenso
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 * @returns {string|null} Resposta do bot ou null
 */
function handleSuspendedState(message, userId) {
  // Se for comando de menu, reativa o bot
  if (isMenuCommand(message)) {
    // Limpa o timeout de suspensão
    if (suspensionTimeouts.has(userId)) {
      clearTimeout(suspensionTimeouts.get(userId))
      suspensionTimeouts.delete(userId)
    }

    setUserState(userId, STATES.MAIN_MENU)
    return MESSAGES.WELCOME
  }

  // Caso contrário, informa que está sendo atendido por humano
  return MESSAGES.BOT_SUSPENDED
}

/**
 * Função principal para processar mensagens
 * @param {string} message - Mensagem recebida
 * @param {string} userId - ID do usuário
 * @returns {string|null} Resposta do bot ou null se não houver resposta
 */
function processMessage(message, userId) {
  const currentState = getUserState(userId)

  // Atualiza timestamp da última interação
  updateLastInteraction(userId)

  // Se o bot estiver suspenso para este usuário
  if (currentState === STATES.SUSPENDED) {
    return handleSuspendedState(message, userId)
  }

  // Verifica se deve mostrar o menu (primeira mensagem ou após inatividade)
  if (shouldShowMenu(userId)) {
    setUserState(userId, STATES.ACTIVE_CONVERSATION)
    setInactivityTimeout(userId)
    return MESSAGES.WELCOME
  }

  // Se está em conversa ativa
  if (currentState === STATES.ACTIVE_CONVERSATION) {
    return handleActiveConversation(message, userId)
  }

  // Estado padrão - não deveria chegar aqui, mas por segurança
  setUserState(userId, STATES.MAIN_MENU)
  return MESSAGES.WELCOME
}

/**
 * Força a reativação do bot para um usuário (útil para testes)
 * @param {string} userId - ID do usuário
 */
function reactivateBotForUser(userId) {
  // Limpa todos os timeouts
  if (suspensionTimeouts.has(userId)) {
    clearTimeout(suspensionTimeouts.get(userId))
    suspensionTimeouts.delete(userId)
  }
  if (inactivityTimeouts.has(userId)) {
    clearTimeout(inactivityTimeouts.get(userId))
    inactivityTimeouts.delete(userId)
  }

  setUserState(userId, STATES.MAIN_MENU)
  console.log(`Bot reativado manualmente para usuário: ${userId.replace("@s.whatsapp.net", "")}`)
}

module.exports = {
  processMessage,
  getUserState,
  setUserState,
  suspendBotForUser,
  reactivateBotForUser,
}
