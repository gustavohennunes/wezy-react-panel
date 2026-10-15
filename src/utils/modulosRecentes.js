// MÓDULOS ABERTOS POR ÚLTIMO (SÓ O pag), PARA O "RECENTES" DO DASHBOARD. FICA NO NAVEGADOR DE QUEM USA:
// É SÓ UMA CONVENIÊNCIA — SEM localStorage (ABA ANÔNIMA, BLOQUEIO) O DASHBOARD SÓ NÃO MOSTRA A LISTA.
// UMA LISTA POR CLIENTE (customer-host): O MESMO pag PODE EXISTIR EM OUTRO PAINEL, E O HISTÓRICO DE UM NÃO É DO OUTRO.
// SEPARAR EM VEZ DE APAGAR NA TROCA: QUEM ALTERNA ENTRE CLIENTES (?a=, "Acessar painel") REENCONTRA OS RECENTES DE CADA UM

import { getCustomerHost } from './customerHost'

const LIMITE = 6

const chave = () => 'modulos-recentes:' + (getCustomerHost() || '')

//CHAVE ANTIGA, SEM O CLIENTE: NÃO DÁ PARA SABER DE QUAL PAINEL ERAM OS MÓDULOS, ENTÃO SÓ É REMOVIDA
try {
    localStorage.removeItem('modulos-recentes')
} catch {
    //SEM ARMAZENAMENTO: IGNORA
}

const lerRecentes = () => {
    try {
        const lista = JSON.parse(localStorage.getItem(chave()) || '[]')
        return Array.isArray(lista) ? lista.filter((pag) => typeof pag === 'string') : []
    } catch {
        return []
    }
}

const registrarRecente = (pag) => {
    if (!pag || pag === 'dashboard') return
    try {
        const lista = [pag, ...lerRecentes().filter((item) => item !== pag)].slice(0, LIMITE)
        localStorage.setItem(chave(), JSON.stringify(lista))
    } catch {
        //SEM ARMAZENAMENTO: IGNORA
    }
}

export { lerRecentes, registrarRecente }
