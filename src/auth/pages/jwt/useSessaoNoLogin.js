import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearCustomerHostWithoutParam, getFixedCustomerHost } from '@/utils/customerHost'
import { useAuthContext } from '@/auth'
import { limparVoltaAposLogin } from '@/auth/voltaAposLogin'
import { getAuthToken } from '@/auth/_helpers'
import { cadastroLiberadoNoCliente } from '@/auth/providers/authApi'

// SESSÃO JÁ ABERTA ENQUANTO A TELA DE LOGIN ESTÁ NA FRENTE (F5 COM SESSÃO VÁLIDA OU LOGIN FEITO EM OUTRA ABA).
// destino: O ?a= JÁ TROCA SOZINHO PELO RequireAuth
const useSessaoNoLogin = (destino, from) => {

    const { auth, loading: verificandoSessao } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()

    //O from ATUAL FICA NA REF: O EFFECT ABAIXO SÓ RODA QUANDO A SESSÃO MUDA
    const fromRef = useRef(from)
    useEffect(() => {
        fromRef.current = from
    }, [from])

    //JÁ LOGADO (ex.: A SESSÃO EXPIROU EM VÁRIAS ABAS E O LOGIN FOI FEITO EM OUTRA): O F5 NO /auth/login CONTINUAVA NO LOGIN.
    //COM A SESSÃO VÁLIDA (DEPOIS DO verify, QUE LIMPA TOKEN INVÁLIDO) SEGUE PARA A TELA GUARDADA DESTA ABA, COMO APÓS O LOGIN
    useEffect(() => {
        if (destino || verificandoSessao || !auth) return
        limparVoltaAposLogin()
        navigate(fromRef.current, { replace: true })
    }, [auth, verificandoSessao, destino, navigate])

    //LOGIN FEITO EM OUTRA ABA (O TOKEN APARECE NO localStorage): ESTA ABA SEGUE SOZINHA PARA A TELA GUARDADA, SEM PRECISAR DO F5.
    //RECARREGA (E NÃO SÓ navigate) PARA O PROVIDER LER A SESSÃO NOVA E VALIDAR NO verify
    useEffect(() => {
        if (destino) return
        const aoMudarStorage = () => {
            if (getAuthToken()) {
                limparVoltaAposLogin()
                window.location.replace(from)
            }
        }
        window.addEventListener('storage', aoMudarStorage)
        return () => window.removeEventListener('storage', aoMudarStorage)
    }, [destino, from])

    //DESLOGADO EM /auth/login (OU / -> /auth/login) SEM ?a=: ESQUECE O customer-host / customer-host-fixo DE UM ?a=
    //ANTERIOR — SENÃO O LOGIN IA DIRETO PARA AQUELE CLIENTE (panel/login) EM VEZ DO CENTRAL
    //COM SESSÃO SALVA (LOGIN FEITO EM OUTRA ABA) NÃO APAGA: O customer-host É DO localStorage, COMPARTILHADO ENTRE AS ABAS, E
    //É O PAINEL DAQUELE TOKEN. APAGADO, O F5 DESTA ABA VALIDAVA O TOKEN NO PAINEL ERRADO ("Token de sessão inválido")
    useEffect(() => {
        if (getAuthToken()) return
        clearCustomerHostWithoutParam()
    }, [location.search])

}

//"Cadastre-se!" SÓ NO PAINEL DE UM CLIENTE (?a= OU DOMÍNIO DO CLIENTE) COM "Habilitar cadastro de usuários" LIGADO
//(panel/login-config). NO LOGIN CENTRAL NÃO EXISTE CLIENTE PARA CADASTRAR
const useCadastroLiberado = () => {

    const clienteFixo = getFixedCustomerHost()
    //A RESPOSTA FICA MARCADA COM O CLIENTE DELA: TROCOU DE CLIENTE, VALE false ATÉ A NOVA CHEGAR
    const [liberado, setLiberado] = useState({ cliente: null, valor: false })

    useEffect(() => {
        if (!clienteFixo) return
        let ativo = true
        cadastroLiberadoNoCliente()
            .catch(() => false)
            .then((valor) => {
                if (ativo) setLiberado({ cliente: clienteFixo, valor })
            })
        return () => {
            ativo = false
        }
    }, [clienteFixo])

    return Boolean(clienteFixo) && liberado.cliente === clienteFixo && liberado.valor

}

export { useSessaoNoLogin, useCadastroLiberado }
