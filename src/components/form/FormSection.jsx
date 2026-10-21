
    import { useState } from 'react'
    import { BotaoExcluirRegistro } from './BotaoExcluirRegistro'
    import { chaveValid, parseAttributes, linhaEscondidaPorValid } from './atributosDaLinha'
    import { montaEstadoInicial } from './estadoInicialDaSecao'
    import { useBuscaCep } from './useBuscaCep'
    import { CampoDaSecao } from './LinhasDaSecao'
    import { comChaves } from '@/utils/chavesUnicas'
    import { atualizarConteudoTextoBackend } from './conteudoTextoBackend'

    const SEM_VALID = {}
    const SEM_CONTROLADORES = new Set()
    const nenhumaAcao = () => {}

    //NUMERAÇÃO (campo Cab — A PONTE JÁ ENVIA A CONTAGEM INCREMENTAL), TÍTULO E SUBTÍTULO DA SEÇÃO
    const CabecalhoDaSecao = ({ secao }) => {

        const temNumero = secao.number || secao.number === 0

        //SEÇÃO SEM TÍTULO NEM NÚMERO (ex.: CARTÃO SÓ COM CAMPOS aut, COMO O relatorio-vendas): SEM A FAIXA DO CABEÇALHO VAZIA
        if (!temNumero && !String(secao.title ?? '').trim() && !secao.subTitle) return null

        return (
            <div className="card-header !min-h-[46px] !py-2.5 bg-[color:var(--form-header-bg)] rounded-t-[8px]" id="general_settings">

                <div className="flex items-center gap-2.5">

                    {/* NUMERAÇÃO DA SEÇÃO — compacta para não disputar atenção com o título */}
                    {temNumero && (
                        <span className="flex size-[22px] shrink-0 items-center justify-center rounded bg-primary text-[11px] font-semibold tabular-nums text-primary-inverse">
                            {String(secao.number).padStart(2, '0')}
                        </span>
                    )}

                    <div className="flex flex-col gap-px">

                        <h3 className="text-[13px] font-semibold leading-tight uppercase tracking-wide text-gray-900">
                            {secao.title}
                        </h3>

                        {secao.subTitle && (
                            <p className="text-[11px] font-normal leading-tight text-gray-500">
                                {secao.subTitle}
                            </p>
                        )}

                    </div>

                </div>

            </div>
        )

    }

    // ALINHADO COM A COLUNA DOS CAMPOS (O SEPARADOR VEM DO CONTAINER)
    const BotoesDaSecao = ({ form, loading }) => (
        <div className="flex flex-wrap lg:flex-nowrap gap-2.5 lg:gap-4 px-4">

            <div className="hidden lg:block lg:w-56 lg:min-w-56 lg:shrink-0"></div>

            <div className="w-full lg:flex-1 flex flex-wrap items-center gap-2.5">
                <button type="submit" className="btn btn-success" disabled={Boolean(loading)}>
                    {loading ? 'Carregando...' : form.submit_button}
                </button>
                {/* $botaoExcluirForm DO CARTÃO (VER BotaoExcluirRegistro) */}
                {form.delete_button === true && <BotaoExcluirRegistro />}
            </div>

        </div>
    )

    //validRows/setValidRows/controladores VÊM DO FormContext: SÃO DO FORMULÁRIO INTEIRO, COMO NO painel.js LEGADO
    //(ajustaValidFromTr) — O CONTROLADOR (ex.: "Copiar Section") PODE ESTAR EM OUTRA SEÇÃO DAS LINHAS QUE ELE MOSTRA
    //categoriaAtiva: ABA DE CATEGORIA DO FormContext (Javascript:openCategory('x') DO CARTÃO projetos-css-padrao). LINHA COM
    //data-category DE OUTRA ABA FICA ESCONDIDA (NO DOM, PARA O VALOR IR NO ENVIO, COMO O .hide() DO LEGADO); "url" APARECE EM TODAS
    const FormSection = ({ data, button, form, loading, validRows = SEM_VALID, setValidRows = nenhumaAcao, controladores = SEM_CONTROLADORES, oculta = false, categoriaAtiva = null }) => {

        //NOVO data (OUTRA RESPOSTA DA PONTE, RECARGA APÓS SALVAR): RECOMEÇA DURANTE O RENDER, NÃO NUM useEffect —
        //ASSIM OS CAMPOS JÁ NASCEM COM O VALOR, SEM UM FRAME VAZIO
        const [formState, setFormState] = useState(() => montaEstadoInicial(data))
        const [dataAnterior, setDataAnterior] = useState(data)
        if (data !== dataAnterior) {
            setDataAnterior(data)
            setFormState(montaEstadoInicial(data))
        }

        const buscaCepDoCampo = useBuscaCep(data, formState, setFormState)

        const params = new URLSearchParams(window.location.search)
        const textoDoBackend = (params.get('pag') || params.get('slug')) === 'projetos-paginas-sections-backend' &&
            ['TxtContent', 'TxtDinamic_content'].every((nome) => data.fields.some((field) => (field.field?.name || field.name) === nome))

        const atualiza = (name, value) => setFormState((prev) => textoDoBackend
            ? atualizarConteudoTextoBackend(prev, name, value)
            : { ...prev, [name]: value })

        //CAMPO CONTROLADOR DE LINHAS CONDICIONAIS (classe valid valid-xxx): O VALOR DELE MOSTRA/ESCONDE AS LINHAS data-valid-xxx
        const atualizaValid = (className, value) => {
            const key = chaveValid(className)
            if (key) setValidRows((prev) => ({ ...prev, [key]: value }))
        }

        const onSelect = (name, value) => {

            if (value == '') return

            //'-1' É O PLACEHOLDER "Selecione uma opção" DO FormSelect — GRAVA VAZIO, NÃO '-1'
            const valor = value === '-1' ? '' : value

            const campoSelect = data.fields.find((f) => (f.field?.name || f.name) === name)
            atualizaValid(campoSelect?.field?.class, valor)
            atualiza(name, valor)

        }

        const onRadio = (name, value, className) => {
            atualizaValid(className, value)
            atualiza(name, value)
        }

        const onCheckbox = (fieldName, value, checked, className) => {

            //CHECKBOX CONTROLADOR: MARCADO VALE O value, DESMARCADO VALE '' (painel.js)
            atualizaValid(className, checked ? value : '')

            setFormState((prev) => {
                const prevValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
                return {
                    ...prev,
                    [fieldName]: checked ? [...prevValues, value] : prevValues.filter((v) => v !== value),
                }
            })

        }

        const secao = { formState, onInput: atualiza, onDate: atualiza, onSelect, onRadio, onCheckbox, buscaCepDoCampo }

        //CLASSE E ATRIBUTOS DA LINHA (row_attr); null = LINHA ESCONDIDA POR data-valid-* (NÃO VAI NEM PARA O DOM)
        const linhaDoCampo = (field) => {

            const atributos = parseAttributes(field.row_attr)
            if (linhaEscondidaPorValid(atributos, validRows, controladores)) return null

            //px-4 = mesmo recuo que o .card-body tinha (custom.components.card.px)
            let className = `flex items-start flex-wrap lg:flex-nowrap gap-2.5 lg:gap-4 px-4 ${atributos.class || ''}`
            delete atributos.class

            const categoriaLinha = atributos['data-category']
            if (categoriaAtiva && categoriaLinha && categoriaLinha !== 'url' && categoriaLinha !== categoriaAtiva) {
                className += ' !hidden'
            }

            return { className, atributos }

        }

        return (
            //SEÇÃO SEM NENHUMA LINHA VISÍVEL (ex.: "CAMPOS DA PÁGINA (home)" DO textos-e-imagens, SÓ TÍTULO; OU TODAS AS LINHAS
            //ESCONDIDAS POR data-valid-*): O card-body VAZIO SOME (empty:hidden) E O CABEÇALHO FICA SEM A BORDA DE BAIXO E
            //ARREDONDADO EMBAIXO, EM VEZ DE UMA FAIXA COM PADDING E NADA DENTRO
            <div className={`card mb-3 [&:has(>.card-body:empty)>.card-header]:border-b-0 [&:has(>.card-body:empty)>.card-header]:rounded-b-[8px]${oculta ? ' !hidden' : ''}`}>

                <CabecalhoDaSecao secao={data} />

                {/* CADA CAMPO GANHA UMA LINHA SEPARADORA ACIMA (EXCETO O PRIMEIRO).
                    O padding lateral SAI do container e vai para cada linha, senão a borda
                    ficaria recuada nas laterais em vez de atravessar o card inteiro. */}
                <div className="card-body !px-0 grid gap-4 empty:hidden [&>*+*]:border-t [&>*+*]:border-[color:var(--form-divider)] [&>*+*]:pt-4">

                    {comChaves(data?.fields, (field) => field.field?.name || field.name || `${field.type}|${field.title}`).map(({ item: field, chave }, idx) => {

                        if (!field.field) return null

                        const linha = linhaDoCampo(field)
                        if (!linha) return null

                        return <CampoDaSecao key={chave} field={field} idx={idx} className={linha.className} atributos={linha.atributos} secao={secao} />

                    })}

                    {button && form.submit_button && <BotoesDaSecao form={form} loading={loading} />}

                </div>

            </div>
        )

    }

    export { FormSection }
