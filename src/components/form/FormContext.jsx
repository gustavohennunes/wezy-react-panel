    import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { FormSection } from './FormSection'
    import { FormTabs } from './FormTabs'
    import { chaveValid } from './atributosDaLinha'
    import { arquivosRemovidos } from './arquivosRemovidos'
    import { lerAbas, lerControladores, montaSecoes, valorDoControlador } from './estruturaDoFormulario'
    import { useEnvioDoFormulario } from './useEnvioDoFormulario'
    import { temEditorDeCodigo, instalarEditorGlobal } from './editorGlobal'
    import { ScreenLoader } from '@/components/loaders'
    import { KeenIcon } from '@/components/keenicons'
    import { useLegacyCodeEditor } from './LegacyCodeEditor'
    import { useLegacyModoCriacao } from './LegacyModoCriacao'
    import { comChaves } from '@/utils/chavesUnicas'

    const SEM_CAMPOS = []

    //HIDDENS QUE O FormContext JÁ MONTA (Inserir/Alterar/Id); OS OUTROS DE form.hidden_fields VÊM DO CARTÃO
    const HIDDENS_DO_FORMULARIO = new Set(['Inserir', 'Alterar', 'id'])

    //$('#envioConteudo').submit() DO JS DOS CARTÕES (ex.: "Enviar e-mail" DO emails-disparos): O jQuery CHAMA O
    //form.submit() NATIVO, QUE NÃO DISPARA O EVENTO submit — PULAVA O onSubmit DO REACT E POSTAVA A PÁGINA CRUA NO
    //ENDEREÇO DO PAINEL REACT. NESTE <form> O submit() DISPARA UM EVENTO submit, QUE O onSubmit DO REACT RECEBE (E MANDA
    //PARA A API). EVENTO E NÃO requestSubmit(): O form.submit() DO LEGADO NÃO PASSAVA PELA VALIDAÇÃO DO NAVEGADOR, E UM
    //CAMPO required ESCONDIDO (LINHA CONDICIONAL) CANCELAVA O ENVIO SEM AVISO
    const prepararEnvioLegado = (form) => {
        if (form) {
            form.submit = () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        }
    }

    //LINHAS CONDICIONAIS (data-valid-xxx) DO FORMULÁRIO INTEIRO — VER FormSection
    const useLinhasCondicionais = (campos) => {

        const { controladores, validIniciais } = useMemo(() => lerControladores(campos), [campos])

        //null NA MONTAGEM: O validRows TAMBÉM RECEBE OS VALORES INICIAIS. OUTRO data RECOMEÇA DURANTE O RENDER
        const [ validRows, setValidRows ] = useState({})
        const [ validIniciaisAnteriores, setValidIniciaisAnteriores ] = useState(null)
        if (validIniciais !== validIniciaisAnteriores) {
            setValidIniciaisAnteriores(validIniciais)
            setValidRows(validIniciais)
        }

        //CONTROLADOR CRU DENTRO DE CAMPO aut (VER controladoresDoHtml): O CLIQUE NO RADIO/CHECKBOX DO HTML LEGADO ATUALIZA AS
        //LINHAS CONDICIONAIS, COMO O ajustaValidFromTr DO painel.js FAZIA PARA QUALQUER .valid DA PÁGINA
        useEffect(() => {

            const aoMudar = (event) => {

                const campo = event.target
                if (!(campo instanceof Element) || !campo.closest('.legacy-html')) return

                const chave = chaveValid(campo.getAttribute('class'))
                if (!chave || !controladores.has(chave)) return

                const valor = valorDoControlador(campo)
                if (valor === undefined) return

                setValidRows((anterior) => (anterior[chave] === valor ? anterior : { ...anterior, [chave]: valor }))

            }

            document.addEventListener('change', aoMudar)
            return () => document.removeEventListener('change', aoMudar)

        }, [controladores])

        return { controladores, validRows, setValidRows }

    }

    //ABAS DO CARTÃO E A ABA DE CATEGORIA ATIVA (null = FORMULÁRIO SEM ESSE TIPO DE ABA)
    const useAbasDoFormulario = (data) => {

        const [ formTabs, setFormTabs ]             = useState(null)
        const [ categoriaAtiva, setCategoriaAtiva ] = useState(null)

        //RECALCULADAS DURANTE O RENDER QUANDO CHEGA OUTRO data (SEM UM FRAME COM AS ABAS ANTERIORES)
        const [ dataDasAbas, setDataDasAbas ] = useState(null)
        if (data !== dataDasAbas) {
            setDataDasAbas(data)
            if (data?.buttons?.form) {
                const { abas, categorias } = lerAbas(data.buttons.form)
                setFormTabs(abas)
                //ABRE NA PRIMEIRA ABA (O CARTÃO CHAMAVA openCategory('colors') AO CARREGAR); APÓS SALVAR CONTINUA NA MESMA
                setCategoriaAtiva((atual) => (categorias.length === 0 ? null : categorias.includes(atual) ? atual : categorias[0]))
            }
        }

        //A ABA DE CATEGORIA VIRA BOTÃO QUE TROCA A categoriaAtiva, MARCADA COMO ATIVA QUANDO É ELA
        const abas = useMemo(() => formTabs && {
            ...formTabs,
            before: formTabs.before.map((aba) => (aba.categoria
                ? { ...aba, ativa: aba.categoria === categoriaAtiva, onClick: () => setCategoriaAtiva(aba.categoria) }
                : aba)),
        }, [formTabs, categoriaAtiva])

        return { abas, categoriaAtiva }

    }

    // CAMPOS Hdn DO FORMULÁRIO: Inserir OU Alterar/Id/id, E OS QUE O CARTÃO DECLARA (A PONTE OS ENVIA EM form.hidden_fields)
    const CamposOcultos = ({ hidden, inserindo }) => (
        <>
            {inserindo ? (
                <input type="hidden" name="Inserir" id="Inserir" value={hidden?.Inserir} />
            ) : (
                <>
                    <input type="hidden" name="Alterar" id="Alterar" value={hidden?.Alterar} />
                    <input type="hidden" name="Id" id="Id" value={hidden?.id} />
                    {/* name="id" (MINÚSCULO) É O DO framework/formulario.php LEGADO: CARTÕES COM forms() PRÓPRIO LEEM
                        $_POST['id'] (ex.: textos-e-imagens VOLTA PARA &id=$_POST['id'] — SEM ELE A URL FICAVA "&id=") */}
                    <input type="hidden" name="id" id="id" value={hidden?.id ?? ''} />
                </>
            )}

            {Object.entries(hidden || {})
                .filter(([name]) => !HIDDENS_DO_FORMULARIO.has(name))
                .map(([name, value]) => (
                    <input key={`hidden-${name}`} type="hidden" name={name} id={name} value={value ?? ''} />
                ))}
        </>
    )

    const FormContext = ({ data }) => {

        const navigate = useNavigate()
        const campos   = Array.isArray(data?.form?.fields) ? data.form.fields : SEM_CAMPOS

        const { submitForm, loading }                    = useEnvioDoFormulario()
        const { controladores, validRows, setValidRows } = useLinhasCondicionais(campos)
        const { abas, categoriaAtiva }                   = useAbasDoFormulario(data)

        //window.editor PROVISÓRIO ANTES DO <script> DO CARTÃO RODAR (VER instalarEditorGlobal)
        useLayoutEffect(() => {
            if (campos.some((field) => temEditorDeCodigo(field.field?.name || field.name))) {
                return instalarEditorGlobal()
            }
        }, [campos])

        //ATIVA O EDITOR ACE NOS CARDS DE CÓDIGO (ex.: ?pag=modulos) — NO-OP NOS DEMAIS
        useLegacyCodeEditor(data)
        useLegacyModoCriacao(data)

        //"Remover" PENDENTE DE OUTRO FORMULÁRIO (SAIU SEM SALVAR) NÃO PODE VALER AQUI
        useEffect(() => {
            arquivosRemovidos.clear()
        }, [])

        //SEÇÕES DERIVADAS NO RENDER (useMemo) E NÃO NUM useEffect + setSections: COM O EFFECT, O PRIMEIRO RENDER SAÍA SEM
        //CAMPOS E O <script> DO CARTÃO (output-html, RODA LOGO APÓS ESSE RENDER) LIGAVA $('#Selid_email').change,
        //$('.btt-enviar-email').click... EM ELEMENTOS QUE AINDA NÃO EXISTIAM — FUNCIONAVA OU NÃO CONFORME A CORRIDA
        const sections = useMemo(() => comChaves(montaSecoes(campos), (secao) => `${secao.number}|${secao.title}|${secao.categoria || ''}`), [campos])

        //O LOADER VALE APENAS ENQUANTO A PONTE NÃO RESPONDEU. UM FORMULÁRIO SEM CAMPOS
        //É UM RESULTADO VÁLIDO (CARD COM $lista = false E $array VAZIO, QUE NO PAINEL-PHP
        //MONTA A TELA POR echo) — ANTES ISSO PRENDIA A PÁGINA NO ScreenLoader PARA SEMPRE.
        if (!data) {
            return <ScreenLoader />
        }

        //SEÇÃO DE OUTRA ABA DE CATEGORIA: CONTINUA NO DOM (ESCONDIDA) PARA OS CAMPOS IREM NO ENVIO. O BOTÃO DE SALVAR VAI NA
        //ÚLTIMA SEÇÃO VISÍVEL (NO LEGADO O openCategory SEMPRE MOSTRAVA A ÚLTIMA LINHA, A DO BOTÃO)
        const secaoForaDaCategoria = (secao) =>
            Boolean(categoriaAtiva && secao.categoria && secao.categoria !== 'url' && secao.categoria !== categoriaAtiva)

        const ultimaSecaoVisivel = sections.reduce((ultima, { item: secao }, indice) => (secaoForaDaCategoria(secao) ? ultima : indice), sections.length - 1)

        const secoes = sections.map(({ item: section, chave }, index) => (
            <FormSection
                key={chave}
                loading={loading}
                data={section}
                button={index === ultimaSecaoVisivel}
                form={data.form}
                validRows={validRows}
                setValidRows={setValidRows}
                controladores={controladores}
                oculta={secaoForaDaCategoria(section)}
                categoriaAtiva={categoriaAtiva}
            />
        ))

        return (
            <div className="grid gap-1 mx-auto">

                {abas && <FormTabs tabs={abas} />}

                {sections.length === 0 && (
                    <div className="card">
                        <div className="card-body text-2sm text-gray-700">
                            Este módulo não devolveu campos para exibir.
                        </div>
                    </div>
                )}

                {/* SEM SEÇÕES NÃO HÁ CAMPOS NEM BOTÃO DE ENVIO: O FORM SERIA SÓ HIDDENS */}
                {/* $action = 'false' NO CARTÃO: O LEGADO NÃO CRIA O <form> (O CARTÃO TRAZ O PRÓPRIO NO HTML DOS CAMPOS).
                    AQUI VIRA UM <div>, SENÃO O <form> DO CARTÃO FICARIA ANINHADO E O ENVIO IRIA PARA O LUGAR ERRADO */}
                {sections.length > 0 && data?.form?.action === false && (
                    <div>{secoes}</div>
                )}

                {sections.length > 0 && data?.form?.action !== false && (
                    <form
                        //id DO <form> DO LEGADO (framework/formulario.php): O JS DOS CARTÕES ENVIA COM $('#envioConteudo').submit()
                        id="envioConteudo"
                        ref={prepararEnvioLegado}
                        encType="application/x-www-form-urlencoded"
                        onSubmit={submitForm}
                    >
                        <CamposOcultos
                            hidden={data.form?.hidden_fields}
                            inserindo={new URLSearchParams(window.location.search).get('acao') === 'Inserir'}
                        />
                        {secoes}
                    </form>
                )}

                <div className="flex justify-center mt-5">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-sm btn-light text-sm gap-1.5"
                    >
                        <KeenIcon icon="arrow-left" className="text-base" />
                        Voltar
                    </button>
                </div>

            </div>
        )

    }

    export { FormContext }
