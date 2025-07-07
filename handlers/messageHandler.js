const { MESSAGES, STATES, MENU_COMMANDS, INACTIVITY_TIME, SUSPENSION_TIME } = require("../config/constants")

const userStates = new Map()

const suspensionTimeouts = new Map()

const inactivityTimeouts = new Map()

const lastInteraction = new Map()


function getUserState(userId) {
  return userStates.get(userId) || STATES.MAIN_MENU
}

function setUserState(userId, state) {
  userStates.set(userId, state)
}


function updateLastInteraction(userId) {
  lastInteraction.set(userId, Date.now())
}

// nao mexa aqui nem por um krl vai travar o bot todo
function shouldShowMenu(userId) {
  const currentState = getUserState(userId)
  const lastTime = lastInteraction.get(userId)
  const now = Date.now()


  if (!lastTime) {
    return true
  }

  if (now - lastTime > INACTIVITY_TIME) {
    return true
  }

  if (currentState === STATES.MAIN_MENU) {
    return true
  }

  return false
}

function isMenuCommand(message) {
  const normalizedMessage = message.toLowerCase().trim()
  return MENU_COMMANDS.includes(normalizedMessage)
}


function setInactivityTimeout(userId) {
  // Limpa timeout anterior se existir
  if (inactivityTimeouts.has(userId)) {
    clearTimeout(inactivityTimeouts.get(userId))
  }

  const timeout = setTimeout(() => {
    setUserState(userId, STATES.MAIN_MENU)
    inactivityTimeouts.delete(userId)
    console.log(`Usuário ${userId.replace("@s.whatsapp.net", "")} voltou ao estado inicial por inatividade`)
  }, INACTIVITY_TIME)

  inactivityTimeouts.set(userId, timeout)
}

function suspendBotForUser(userId) {

  setUserState(userId, STATES.SUSPENDED)

  if (inactivityTimeouts.has(userId)) {
    clearTimeout(inactivityTimeouts.get(userId))
    inactivityTimeouts.delete(userId)
  }

  if (suspensionTimeouts.has(userId)) {
    clearTimeout(suspensionTimeouts.get(userId))
  }

  const timeout = setTimeout(() => {
    setUserState(userId, STATES.MAIN_MENU)
    suspensionTimeouts.delete(userId)
    console.log(`Bot reativado para usuário: ${userId.replace("@s.whatsapp.net", "")}`)
  }, SUSPENSION_TIME)

  suspensionTimeouts.set(userId, timeout)

  console.log(`Bot suspenso por 10 minutos para usuário: ${userId.replace("@s.whatsapp.net", "")}`)
}


function handleMainMenu(message, userId) {
  const option = message.trim()

  switch (option) {
    case "1":
      setUserState(userId, STATES.ACTIVE_CONVERSATION)
      setInactivityTimeout(userId)
      return MESSAGES.CONSULTATION_DETAILS

    case "2":
      
      suspendBotForUser(userId)
      return MESSAGES.HUMAN_ATTENDANT

    case "3":
      setUserState(userId, STATES.ACTIVE_CONVERSATION)
      setInactivityTimeout(userId)
      return MESSAGES.GROUP_LINK

    default:
      
      return null
  }
}


function handleActiveConversation(message, userId) {

  if (isMenuCommand(message)) {
    setUserState(userId, STATES.MAIN_MENU)

    if (inactivityTimeouts.has(userId)) {
      clearTimeout(inactivityTimeouts.get(userId))
      inactivityTimeouts.delete(userId)
    }
    return MESSAGES.WELCOME
  }


  setInactivityTimeout(userId)

  return null
}

function handleSuspendedState(message, userId) {

  if (isMenuCommand(message)) {
 
    if (suspensionTimeouts.has(userId)) {
      clearTimeout(suspensionTimeouts.get(userId))
      suspensionTimeouts.delete(userId)
    }

    setUserState(userId, STATES.MAIN_MENU)
    return MESSAGES.WELCOME
  }


  return MESSAGES.BOT_SUSPENDED
}

function processMessage(message, userId) {
  const currentState = getUserState(userId)


  updateLastInteraction(userId)

 
  if (currentState === STATES.SUSPENDED) {
    return handleSuspendedState(message, userId)
  }


  if (shouldShowMenu(userId)) {
    setUserState(userId, STATES.ACTIVE_CONVERSATION)
    setInactivityTimeout(userId)
    return MESSAGES.WELCOME
  }


  if (currentState === STATES.ACTIVE_CONVERSATION) {
    return handleActiveConversation(message, userId)
  }


  setUserState(userId, STATES.MAIN_MENU)
  return MESSAGES.WELCOME
}


function reactivateBotForUser(userId) {

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
