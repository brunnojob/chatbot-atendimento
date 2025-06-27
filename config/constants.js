// Configurações e constantes do chatbot
const MESSAGES = {
  // Mensagem de boas-vindas
  WELCOME: `Olá! Seja bem-vindo(a) ao atendimento (seu atendimento).

Escolha uma das opções abaixo:

1 - uma opção de sua escolha
2 - uma opção de sua escolha
3 - uma opção de sua escolha

_Digite o número da opção desejada._`,

  // Detalhes sobre consulta
  CONSULTATION_DETAILS: `*resposta da opção escolhida*

*1 - resposta opção escolhida*
comentário sobre resposta.

*2 - resposta opção escolhida*
comentário sobre resposta.

*3 - resposta opção escolhida*
comentário sobre resposta.



_Digite "menu" para voltar às opções principais._`,

  // Atendimento humano
  HUMAN_ATTENDANT: `mensagem desejada caso você tenha como opção um atendente real. `,

  // link externo
  GROUP_LINK: `mensagem + link, caso você tenha algum link externo`,

  // Mensagem de despedida
  GOODBYE: `Obrigada pelo contato!

Estamos sempre aqui para ajudar. Até logo!`,

  // Mensagem quando bot está suspenso
  BOT_SUSPENDED: `mensagem de suspensão`,
}

// Estados possíveis da conversa
const STATES = {
  MAIN_MENU: "main_menu",
  ACTIVE_CONVERSATION: "active_conversation", // Novo estado para conversa ativa
  SUSPENDED: "suspended", // Estado para quando o bot está suspenso
}

// Comandos específicos para voltar ao menu (apenas "voltar" agora)
const MENU_COMMANDS = ["voltar"]

// Tempo de inatividade em milissegundos (10 minutos)
const INACTIVITY_TIME = 10 * 60 * 1000 // 10 minutos

// Tempo de suspensão em milissegundos (10 minutos)
const SUSPENSION_TIME = 10 * 60 * 1000 // 10 minutos

module.exports = {
  MESSAGES,
  STATES,
  MENU_COMMANDS,
  INACTIVITY_TIME,
  SUSPENSION_TIME,
}
