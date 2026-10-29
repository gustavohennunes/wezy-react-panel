    // AMBIENTE DOS <script> DOS CARTÕES DENTRO DO PAINEL REACT. NO LEGADO CADA TELA ERA UM DOCUMENTO NOVO; AQUI O
    // DOCUMENTO É UM SÓ (SPA) E OS SCRIPTS SÃO INSERIDOS DEPOIS DE A PÁGINA TER CARREGADO. SEM ESTE AMBIENTE:
    //  - DOMContentLoaded / load / window.onload / $(window).load NUNCA DISPARAVAM (ex.: 362/empresas, 383/banner);
    //  - $(document).on(...), document.addEventListener(...) E setInterval(...) FICAVAM VIVOS DEPOIS DE SAIR DO CARTÃO
    //    E SE SOMAVAM A CADA VISITA (O MESMO CLIQUE RODAVA 2, 3 VEZES).
    // CADA LegacyHtml CRIA UM "registros" (criarRegistros), O executarScript O PENDURA NO <script> E AS FUNÇÕES ABAIXO
    // DESCOBREM DE QUAL CARTÃO É A CHAMADA PELO document.currentScript. SÓ O QUE FOI REGISTRADO NO DOCUMENTO/JANELA É
    // DESFEITO AO SAIR (O QUE FICA DENTRO DO HTML DO CARTÃO SOME JUNTO COM ELE)

    let instalado = false

    //CALLBACK ADIADO (DOMContentLoaded...) RODA FORA DE UM <script>: O CONTEXTO VEM DAQUI
    let registrosEmExecucao = null

    const registrosDaChamada = () => document.currentScript?.registrosDoCartao || registrosEmExecucao

    export const criarRegistros = () => ({ ativo: true, desfazer: [], aoCarregar: [] })

    export const executarNoContexto = (registros, funcao) => {
        const anterior = registrosEmExecucao
        registrosEmExecucao = registros
        try {
            funcao()
        } catch (erro) {
            console.error(erro)
        } finally {
            registrosEmExecucao = anterior
        }
    }

    //"FIM DO CARREGAMENTO" DO CARTÃO: CHAMADO DEPOIS DO ÚLTIMO <script> DO LegacyHtml, COMO O NAVEGADOR FAZIA DEPOIS DE
    //LER A PÁGINA INTEIRA (DOMContentLoaded E load NA ORDEM EM QUE FORAM REGISTRADOS)
    export const dispararCarregamento = (registros) => {
        const pendentes = registros.aoCarregar.splice(0)
        pendentes.forEach((funcao) => {
            if (registros.ativo) executarNoContexto(registros, funcao)
        })
    }

    export const desfazerRegistros = (registros) => {
        registros.ativo = false
        registros.aoCarregar.length = 0
        registros.desfazer.splice(0).forEach((desfazer) => {
            try {
                desfazer()
            } catch {
                //ELEMENTO/HANDLER JÁ REMOVIDO
            }
        })
    }

    //EVENTOS QUE JÁ ACONTECERAM QUANDO O SCRIPT DO CARTÃO RODA
    const eventoDoCarregamento = (alvo, tipo) => tipo === 'DOMContentLoaded' || (alvo === window && tipo === 'load')

    const chamarOuvinte = (ouvinte, alvo, evento) => {
        if (typeof ouvinte === 'function') ouvinte.call(alvo, evento)
        else ouvinte?.handleEvent?.(evento)
    }

    const ouvintesNativos = (alvo) => {
        const original = alvo.addEventListener
        alvo.addEventListener = function (tipo, ouvinte, opcoes) {
            //addEventListener("load", ...) SEM O window. (ex.: 1/funcoes) CHEGA SEM this
            const destino   = this ?? window
            const registros = registrosDaChamada()
            if (!registros || destino !== alvo || !ouvinte) {
                return original.call(destino, tipo, ouvinte, opcoes)
            }
            if (eventoDoCarregamento(alvo, tipo)) {
                registros.aoCarregar.push(() => chamarOuvinte(ouvinte, alvo, new Event(tipo)))
                return
            }
            original.call(this, tipo, ouvinte, opcoes)
            registros.desfazer.push(() => alvo.removeEventListener(tipo, ouvinte, opcoes))
        }
    }

    const intervalos = () => {
        const original = window.setInterval
        window.setInterval = function (...argumentos) {
            const id = original.apply(window, argumentos)
            registrosDaChamada()?.desfazer.push(() => window.clearInterval(id))
            return id
        }
    }

    const eventosDoJquery = (jq) => {

        //O datepicker LIGA O CLIQUE FORA ($(document).mousedown) UMA VEZ SÓ, NO PRIMEIRO .datepicker() — SE FOSSE DENTRO
        //DE UM CARTÃO, SERIA DESFEITO AO SAIR DELE E NENHUM CALENDÁRIO FECHARIA MAIS. LIGA AQUI, FORA DOS CARTÕES
        if (jq.datepicker && !jq.datepicker.initialized) {
            jq(document).mousedown(jq.datepicker._checkExternalClick)
            jq.datepicker.initialized = true
        }

        const original = jq.event.add
        jq.event.add = function (elemento, tipos, handler, dados, seletor) {
            const registros = registrosDaChamada()
            if (!registros || (elemento !== document && elemento !== window && elemento !== document.body)) {
                return original.apply(this, arguments)
            }
            const funcao = handler?.handler || handler
            //$(window).load(fn) / $(window).on('load', fn)
            if (elemento === window && tipos === 'load' && typeof funcao === 'function') {
                registros.aoCarregar.push(() => funcao.call(window, jq.Event('load')))
                return
            }
            original.apply(this, arguments)
            registros.desfazer.push(() => jq.event.remove(elemento, tipos, funcao, handler?.selector ?? seletor))
        }

    }

    export const instalarAmbienteDoCartao = () => {
        if (instalado) return
        instalado = true
        ouvintesNativos(document)
        ouvintesNativos(window)
        intervalos()
        if (window.jQuery?.event?.add) eventosDoJquery(window.jQuery)
    }
