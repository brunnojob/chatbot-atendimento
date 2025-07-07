
const MESSAGES = {

  WELCOME: `Olá! Seja bem-vindo(a) ao atendimento (seu atendimento).

Escolha uma das opções abaixo:

1 - uma opção de sua escolha
2 - uma opção de sua escolha
3 - uma opção de sua escolha

_Digite o número da opção desejada._`,


  CONSULTATION_DETAILS: `*resposta da opção escolhida*

*1 - resposta opção escolhida*
comentário sobre resposta.

*2 - resposta opção escolhida*
comentário sobre resposta.

*3 - resposta opção escolhida*
comentário sobre resposta.



_Digite "menu" para voltar às opções principais._`,


  HUMAN_ATTENDANT: `mensagem desejada caso você tenha como opção um atendente real. `,


  GROUP_LINK: `mensagem + link, caso você tenha algum link externo`,


  GOODBYE: `Obrigada pelo contato!

Estamos sempre aqui para ajudar. Até logo!`,


  BOT_SUSPENDED: `mensagem de suspensão`,
}


const STATES = {
  MAIN_MENU: "main_menu",
  ACTIVE_CONVERSATION: "active_conversation", 
  SUSPENDED: "suspended", 


const MENU_COMMANDS = ["voltar"]


const INACTIVITY_TIME = 10 * 60 * 1000 


const SUSPENSION_TIME = 10 * 60 * 1000 

module.exports = {
  MESSAGES,
  STATES,
  MENU_COMMANDS,
  INACTIVITY_TIME,
  SUSPENSION_TIME,
}
