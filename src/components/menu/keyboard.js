//PROPS PARA UM <div> CLICÁVEL DO MENU SE COMPORTAR COMO BOTÃO: RECEBE FOCO PELO Tab, É ANUNCIADO
//COMO BOTÃO PELO LEITOR DE TELA E RESPONDE A Enter/Espaço COM O MESMO HANDLER DO CLIQUE
export const propsDeBotao = (handler) => {

    if (!handler) return {}

    return {
        role: 'button',
        tabIndex: 0,
        onClick: handler,
        onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handler(event)
            }
        },
    }

}
