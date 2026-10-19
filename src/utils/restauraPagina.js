// VOLTA PARA ONDE O USUÁRIO ESTAVA QUANDO A PÁGINA É RECARREGADA: F5, VOLTAR/AVANÇAR DO NAVEGADOR OU ABA QUE O CHROME
// DESCARTOU EM SEGUNDO PLANO (Economia de memória: AO VOLTAR PARA A ABA ELE RECARREGA SOZINHO, E PARECIA QUE O PAINEL
// "ATUALIZAVA SOZINHO"). O CONTEÚDO VEM DA API DEPOIS DO LOAD, ENTÃO O NAVEGADOR NÃO CONSEGUE RESTAURAR SOZINHO: A ROLAGEM
// (E QUANTAS PÁGINAS DO "Carregar mais conteúdo" ESTAVAM ABERTAS) FICA NO sessionStorage, POR URL, E VOLTA DEPOIS DO FETCH.
// SÓ VALE PARA A PRIMEIRA TELA DO DOCUMENTO; NAVEGAR PELO MENU CONTINUA ABRINDO NO TOPO

const tipoNavegacao = (() => {
    try {
        return performance.getEntriesByType('navigation')[0]?.type || ''
    } catch {
        return ''
    }
})()

const recarregou = tipoNavegacao === 'reload' || tipoNavegacao === 'back_forward' || document.wasDiscarded === true

const urlAtual = () => window.location.pathname + window.location.search

//URL DO CARREGAMENTO DO DOCUMENTO: SE O USUÁRIO JÁ NAVEGOU PARA OUTRA TELA, NADA É RESTAURADO
const urlInicial = urlAtual()

let restauracaoEncerrada = !recarregou

//NA JANELA (CELULAR) O NAVEGADOR RESTAURARIA SOZINHO, ANTES DE O CONTEÚDO EXISTIR, E BRIGARIA COM A RESTAURAÇÃO DAQUI
if (recarregou && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
}

export const devePaginaSerRestaurada = () => !restauracaoEncerrada && urlAtual() === urlInicial

export const encerrarRestauracao = () => {
    restauracaoEncerrada = true
}

const ler = (chave) => {
    try {
        return JSON.parse(sessionStorage.getItem(chave) || 'null')
    } catch {
        return null
    }
}

const gravar = (chave, valor) => {
    try {
        sessionStorage.setItem(chave, JSON.stringify(valor))
    } catch {
        //SEM sessionStorage (ABA PRIVADA, COTA): SÓ NÃO RESTAURA
    }
}

export const lerRolagem = () => ler('restaura-rolagem:' + urlAtual())
export const gravarRolagem = (topo) => gravar('restaura-rolagem:' + urlAtual(), topo)

export const lerPaginasCarregadas = () => Number(ler('restaura-paginas:' + urlAtual()) || 1)
export const gravarPaginasCarregadas = (paginas) => gravar('restaura-paginas:' + urlAtual(), paginas)

//CONTEÚDO QUE AINDA ESTÁ VINDO DEPOIS DO FETCH DA TELA (ex.: AS PÁGINAS DO "Carregar mais conteúdo" SENDO REABERTAS):
//A ROLAGEM ESPERA ACABAR, SENÃO A TELA AINDA NÃO TEM ALTURA PARA CHEGAR LÁ
let carregamentosPendentes = 0

export const inicioCarregamentoExtra = () => {
    carregamentosPendentes += 1
}

export const fimCarregamentoExtra = () => {
    carregamentosPendentes = Math.max(0, carregamentosPendentes - 1)
}

export const carregamentoExtraPendente = () => carregamentosPendentes > 0
