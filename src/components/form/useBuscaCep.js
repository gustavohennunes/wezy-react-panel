    import { useMemo, useState } from 'react'
    import { toast } from 'sonner'

    const nomeDoCampo = (campo) => campo.field?.name || campo.name

    //ESTADO EM SELECT: A OPÇÃO PODE TER A SIGLA ("SC") OU O NOME ("Santa Catarina") COMO VALOR OU RÓTULO
    const opcaoDoEstado = (opcoes, endereco) => {
        const alvo = new Set([endereco.uf, endereco.estado].filter(Boolean).map((texto) => String(texto).toLowerCase()))
        return opcoes.find((opcao) =>
            alvo.has(String(opcao.value ?? '').toLowerCase()) || alvo.has(String(opcao.label ?? '').trim().toLowerCase())
        )
    }

    // ----- BUSCA DE CEP (jscripts/framework.js DO LEGADO: triggerBuscarCep) -----
    //O CARTÃO MARCA OS CAMPOS COM data-buscar-cep="cep|rua|bairro|cidade|estado|complemento" NO attr. O CAMPO cep
    //GANHA O BOTÃO "Buscar endereço" (E O ENTER); A RESPOSTA DO viacep PREENCHE OS OUTROS CAMPOS DESTA SEÇÃO
    const useBuscaCep = (secao, formState, setFormState) => {

        const camposCep = useMemo(() => {
            const mapa = {}
            ;(secao?.fields || []).forEach((field) => {
                const papel = /data-buscar-cep="(\w+)"/.exec(field.field?.attr || '')?.[1]
                if (papel && !mapa[papel]) mapa[papel] = field
            })
            return mapa
        }, [secao])

        const [buscandoCep, setBuscandoCep] = useState(false)

        const preencherEndereco = (endereco) => {

            const valores = {
                rua: endereco.logradouro,
                bairro: endereco.bairro,
                complemento: endereco.complemento,
                cidade: endereco.localidade,
                estado: endereco.uf,
            }

            setFormState((prev) => {

                const proximo = { ...prev }

                Object.entries(valores).forEach(([papel, valor]) => {

                    const campo = camposCep[papel]
                    if (!campo) return

                    if (Array.isArray(campo.field?.options)) {
                        const opcao = opcaoDoEstado(campo.field.options, endereco)
                        if (opcao) proximo[nomeDoCampo(campo)] = opcao.value
                        return
                    }

                    proximo[nomeDoCampo(campo)] = valor ?? ''

                })

                return proximo

            })

        }

        const buscarCep = async () => {

            const campoCep = camposCep.cep
            if (!campoCep || buscandoCep) return

            const cep = String(formState[nomeDoCampo(campoCep)] || '').replace(/\D/g, '')
            if (cep === '') return

            if (cep.length !== 8) {
                toast.error('Formato de CEP inválido!')
                return
            }

            setBuscandoCep(true)

            try {

                const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
                if (!resposta.ok) throw new Error()
                const endereco = await resposta.json()

                if (endereco.erro) {
                    toast.error('CEP inexistente!')
                    return
                }

                preencherEndereco(endereco)

            } catch {
                toast.error('Formato de CEP inválido!')
            } finally {
                setBuscandoCep(false)
            }

        }

        //O CAMPO QUE RECEBE O BOTÃO "Buscar endereço"
        const buscaCepDoCampo = (field) => (camposCep.cep === field ? { buscar: buscarCep, buscando: buscandoCep } : null)

        return buscaCepDoCampo

    }

    export { useBuscaCep }
