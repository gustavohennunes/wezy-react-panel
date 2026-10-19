// TELA PARA ONDE O LOGIN VOLTA DEPOIS DE A SESSÃO EXPIRAR (VER RequireAuth E Login). FICA NO sessionStorage PARA
// SOBREVIVER A UM F5 NA TELA DE LOGIN; É DA ABA, ENTÃO OUTRA ABA NÃO HERDA

const CHAVE = 'voltar-apos-login'

export const guardarVoltaAposLogin = (caminho) => {

    //TELA INICIAL OU TELAS DE LOGIN/CADASTRO NÃO PRECISAM DE VOLTA
    if (!caminho || caminho === '/' || caminho.startsWith('/auth')) return

    try {
        sessionStorage.setItem(CHAVE, caminho)
    } catch {
        //SEM sessionStorage: FICA SÓ O state DA NAVEGAÇÃO
    }

}

export const lerVoltaAposLogin = () => {
    try {
        const caminho = sessionStorage.getItem(CHAVE) || ''
        //SÓ CAMINHO INTERNO (NADA DE //host OU URL ABSOLUTA)
        return caminho.startsWith('/') && !caminho.startsWith('//') ? caminho : ''
    } catch {
        return ''
    }
}

export const limparVoltaAposLogin = () => {
    try {
        sessionStorage.removeItem(CHAVE)
    } catch {
        //NADA A LIMPAR
    }
}
