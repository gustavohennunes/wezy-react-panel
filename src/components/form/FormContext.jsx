    import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
    import { useNavigate } from 'react-router-dom'
    import qs from 'qs'
    import { FormSection } from './'
    import { chaveValid } from './FormSection'
    import { arquivosRemovidos } from './FormFile'

    //Ctrl+S: O JS DOS CARTÕES (ex.: ABA Geral DA SECTION) FAZ $("form").submit() NO ATALHO. NO PAINEL REACT O ATALHO SÓ SALVA,
    //SEM REDIRECT NEM RECARREGAR O FORMULÁRIO — ISSO FICA PARA O BOTÃO "Salvar". GUARDA A HORA DO ÚLTIMO Ctrl+S PARA O
    //submitForm SABER DE ONDE VEIO O ENVIO
    let ultimoAtalhoSalvar = 0
    if (typeof document !== 'undefined') {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 's') ultimoAtalhoSalvar = Date.now()
        }, true)
    }
    import { temEditorDeCodigo, instalarEditorGlobal } from './FormCodeEditor'
    import { FormTabs } from './'
    import { ScreenLoader } from '@/components/loaders'
    import { KeenIcon } from '@/components/keenicons'
    import { api } from '@/services/api'
    import { toast } from 'sonner'
    import { avisoSucesso } from '@/utils/avisos'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { usePageData } from '@/context/PageDataContext'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useLegacyCodeEditor } from './LegacyCodeEditor'
    import { useLegacyModoCriacao } from './LegacyModoCriacao'
    import { findLegacyRedirectDeep, applyLegacyRedirect } from '@/utils/legacyRedirect'

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

    //CONTROLADORES DE LINHA CONDICIONAL QUE VÊM CRUS NO HTML DE UM CAMPO aut (ex.: CUSTOM FIELDS DO BACK-END DAS SECTIONS:
    //<input type="radio" class="forms obg valid valid-forma-apresentacao-0">, E AS LINHAS COM data-valid-forma-apresentacao-0="4").
    //SEM ISSO O FormSection NÃO CONHECIA A CHAVE E MOSTRAVA TODAS AS LINHAS DE UMA VEZ. DEVOLVE [{ chave, valor inicial }]
    const controladoresDoHtml = (html) => {

        if (!html.includes('valid-') || typeof DOMParser === 'undefined') return []

        const documento = new DOMParser().parseFromString(html, 'text/html')

        return Array.from(documento.querySelectorAll('input, select, textarea')).reduce((lista, campo) => {

            const chave = chaveValid(campo.getAttribute('class'))
            if (!chave) return lista

            let valor = campo.value || ''
            if (campo.type === 'radio' || campo.type === 'checkbox') {
                valor = campo.checked ? campo.value : ''
            }

            lista.push({ chave, valor: String(valor) })
            return lista

        }, [])

    }

    //ABA DE CATEGORIA: CARTÃO QUE DIVIDE O FORMULÁRIO EM ABAS NA MESMA TELA (ex.: projetos-css-padrao, "Cores | Tipografias |
    //Botões | CSS | JS | Outros"). O LINK DA ABA É Javascript:openCategory('colors') E CADA LINHA TEM data-category="colors";
    //NO LEGADO O openCategory ESCONDIA AS <tr> DAS OUTRAS. AQUI A ABA TROCA O ESTADO E O FormSection ESCONDE
    const categoriaDaAba = (url) =>
        /^\s*javascript:\s*openCategory\(\s*(?:'|"|&#0?39;|&quot;)([\w-]+)/i.exec(url || '')?.[1] || null

    const FormContext = ({ data }) => {

        const navigate = useNavigate();

        const params = new URLSearchParams(window.location.search);

        const acao = params.get('acao');

        const [ formTabs, setFormTabs ]      = useState('');
        const [ loading, setLoading ]        = useState(false);
        const [ activeTab, setActiveTab ]    = useState('');
        //ABA DE CATEGORIA ATIVA (VER categoriaDaAba) — null = FORMULÁRIO SEM ESSE TIPO DE ABA
        const [ categoriaAtiva, setCategoriaAtiva ] = useState(null);
        //LINHAS CONDICIONAIS (data-valid-xxx) DO FORMULÁRIO INTEIRO — VER FormSection
        const [ validRows, setValidRows ]    = useState({});

        //CAMPOS QUE CONTROLAM LINHAS (classe "valid valid-xxx") E O VALOR INICIAL DE CADA UM
        const { controladores, validIniciais } = useMemo(() => {

            const chaves  = new Set()
            const valores = {}

            ;(Array.isArray(data?.form?.fields) ? data.form.fields : []).forEach((field) => {

                if (field.type === 'Rdo' || field.type === 'Ckb') {

                    ;(Array.isArray(field.field) ? field.field : []).forEach((item) => {
                        const chave = chaveValid(item?.class)
                        if (!chave) return
                        chaves.add(chave)
                        if (!(chave in valores)) valores[chave] = ''
                        if (item.checked && item.value) valores[chave] = String(item.value)
                    })

                } else if (field.type === 'aut' && typeof field.field?.extra_html === 'string') {

                    controladoresDoHtml(field.field.extra_html).forEach(({ chave, valor }) => {
                        chaves.add(chave)
                        if (!(chave in valores) || valor !== '') valores[chave] = valor
                    })

                } else if (field.field && !Array.isArray(field.field)) {

                    const chave = chaveValid(field.field.class)
                    if (!chave) return
                    chaves.add(chave)
                    const marcada = Array.isArray(field.field.options)
                        ? field.field.options.find((o) => o.selected === true || o.selected === 'selected')
                        : null
                    valores[chave] = String(field.field.value || marcada?.value || '')

                }

            })

            return { controladores: chaves, validIniciais: valores }

        }, [data]);

        useEffect(() => {
            setValidRows(validIniciais)
        }, [validIniciais]);

        //CONTROLADOR CRU DENTRO DE CAMPO aut (VER controladoresDoHtml): O CLIQUE NO RADIO/CHECKBOX DO HTML LEGADO ATUALIZA AS
        //LINHAS CONDICIONAIS, COMO O ajustaValidFromTr DO painel.js FAZIA PARA QUALQUER .valid DA PÁGINA
        useEffect(() => {

            const aoMudar = (event) => {

                const campo = event.target
                if (!(campo instanceof Element) || !campo.closest('.legacy-html')) return

                const chave = chaveValid(campo.getAttribute('class'))
                if (!chave || !controladores.has(chave)) return

                let valor
                if (campo.type === 'radio') {
                    if (!campo.checked) return
                    valor = campo.value
                } else if (campo.type === 'checkbox') {
                    valor = campo.checked ? campo.value : ''
                } else {
                    valor = campo.value
                }

                setValidRows((anterior) => (anterior[chave] === String(valor) ? anterior : { ...anterior, [chave]: String(valor) }))

            }

            document.addEventListener('change', aoMudar)
            return () => document.removeEventListener('change', aoMudar)

        }, [controladores]);

        //window.editor PROVISÓRIO ANTES DO <script> DO CARTÃO RODAR (VER instalarEditorGlobal NO FormCodeEditor)
        useLayoutEffect(() => {
            const campos = Array.isArray(data?.form?.fields) ? data.form.fields : []
            if (campos.some((field) => temEditorDeCodigo(field.field?.name || field.name))) {
                return instalarEditorGlobal()
            }
        }, [data]);
        const { callApi }                    = usePageData();
        const { auth, logout }               = useAuth();
        //slug/action DA URL ATUAL (VER Main.jsx)
        const slug                           = params.get('slug') ?? params.get('pag') ?? '';
        const action                         = params.get('action') ?? '';

        //ATIVA O EDITOR ACE NOS CARDS DE CÓDIGO (ex.: ?pag=modulos) — NO-OP NOS DEMAIS
        useLegacyCodeEditor(data);
        useLegacyModoCriacao(data);

        //"Remover" PENDENTE DE OUTRO FORMULÁRIO (SAIU SEM SALVAR) NÃO PODE VALER AQUI
        useEffect(() => {
            arquivosRemovidos.clear()
        }, [])

        async function submitForm(e) {

            e.preventDefault();

            let response = '';
            const form = e.target;
            const formData = new FormData(form);

            //"Remover" DO FormFile: del<campo>=ok E O CAMPO DE ARQUIVO VAZIO (O fotoInsert SÓ OLHA OS CAMPOS QUE CHEGAM EM
            //$_FILES). VEM DAQUI E NÃO DO INPUT PORQUE A LINHA PODE TER SIDO ESCONDIDA (data-valid-*) ANTES DE SALVAR
            arquivosRemovidos.forEach((campo) => {
                formData.set('del' + campo, 'ok')
                if (!formData.has(campo)) formData.append(campo, new Blob([]), '')
            })
            arquivosRemovidos.clear()
            const formDataObject = {};
            
            formData.forEach((value, key) => {
                
                if (formDataObject[key] !== undefined) {
                    
                    if (!Array.isArray(formDataObject[key])) {
                        formDataObject[key] = [formDataObject[key]];
                    }

                    formDataObject[key].push(value);

                } else {
                    formDataObject[key] = value;
                }

            })

            setLoading(true);

            try {

                const urlFormulario = window.location.search;

                response = await api.post(
                    buildApiUrl(urlFormulario),
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                );

                //SALVO PELO Ctrl+S (VER ultimoAtalhoSalvar): FICA NA TELA, SÓ AVISA
                if (acao === 'Alterar' && Date.now() - ultimoAtalhoSalvar < 2000) {
                    avisoSucesso(response?.data?.success?.response?.data?.message || 'Registro alterado com sucesso')
                    setLoading(false)
                    return
                }

                //REDIRECT EMITIDO PELO CARD COMO <script>window.location="..."</script>.
                //VARRE A RESPOSTA BRUTA: COM exit(loc(...)) O PHP DEVOLVE HTML CRU, SEM O JSON.
                const redirectLegado = findLegacyRedirectDeep(response?.data)
                if(redirectLegado && applyLegacyRedirect(redirectLegado, navigate)) {
                    setLoading(false)
                    return
                }

                const dadosResposta = response?.data?.success?.response?.data

                //REDIRECT DECLARADO PELA PONTE (URL no formato legado index.php?pag=...)
                if(dadosResposta?.redirect) {

                    if(applyLegacyRedirect(dadosResposta.redirect, navigate)) {
                        setLoading(false)
                        return
                    }

                }

                if (acao === 'Inserir') {

                    //INSERIR SEM REDIRECT DO CARD: VAI PARA A LISTAGEM PELA URL (O PageDataContext BUSCA OS DADOS)
                    params.delete('acao')
                    params.delete('id')
                    navigate({ search: '?' + params.toString() })

                } else {

                    //PAINEL ANTIGO (framework/formulario.php): DEPOIS DE ALTERAR, VOLTA PARA O MESMO FORMULÁRIO.
                    //ANTES CARREGAVA A LISTAGEM COM A URL AINDA EM acao=Alterar (TIRAVA DO EDITOR DE MÓDULOS
                    //A CADA SALVAMENTO E O F5 REABRIA O FORMULÁRIO). PÁGINA SÓ DE FORMULÁRIO (SEM acao) TAMBÉM RECARREGA
                    callApi(buildApiUrl(params))

                }

                toast(`✅ Sucesso!`, {
                    description: <span style={{'color':'white'}}>{response?.data?.success?.response?.data?.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-success)',
                        border: 'none',
                        fontWeight: 'bold'
                    }
                });

                //CASO ESTEJA NA FINALIZAÇÃO DE CADASTRO, DIRECIONA PARA O DASHBOARD
                if(slug === 'perfil' && action === 'finalizar-cadastro') {
                    window.location.href = '/'
                }

            } catch (error) {
                
                toast(`❌ Erro: `, {
                    description: <span style={{'color':'white'}}>{error.response?.data?.error?.message || error.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        border: 'none',
                        fontWeight: 'bold'
                    }
                })

                if (error.status == 401) {
                    logout()
                }

            } finally {

                //SAI DO ESTADO DE ENVIO EM QUALQUER CAMINHO (SUCESSO, ERRO OU EXCEÇÃO INESPERADA)
                setLoading(false);

            }

            setLoading(false);

        }

        //TRANSFORMA A HTML EM OBJETO
        const parseTabs = (tabs) => {

            const tabsArray = tabs.split('</a>')
            const tabsObject = {
                before: [],
                after: [],
            }
            const categorias = []
            
            tabsArray.forEach((tab) => {
                                    
                let tabUrl  = tab.split('href="')[1];
                    tabUrl  = tabUrl ? tabUrl.split('"')[0] : '';
                let tabName = tab.split('href="')[1];
                    tabName = tabName ? tabName.split('>')[1] : '';

                const categoria = categoriaDaAba(tabUrl)

                if (categoria) {

                    categorias.push(categoria)
                    tabsObject.before.push({
                        content: tabName,
                        categoria: categoria,
                        onClick: () => setCategoriaAtiva(categoria),
                    })

                } else if (tabUrl) {

                    //target="_blank" DO setButtonsModule (BOTÃO DECLARADO COMO array('Nome', true) NO CARTÃO, ex.: "Acessar
                    //Painel" DO menuModulos) — ANTES SE PERDIA AQUI E O BOTÃO ABRIA NA MESMA ABA
                    const tabTarget = /\btarget=["']([^"']+)["']/i.exec(tab)?.[1]

                    tabsObject.before.push({
                        content: tabName,
                        url: tabUrl,
                        ...(tabTarget ? { target: tabTarget } : {}),
                    })

                }

            })
            
            setFormTabs(tabsObject)

            //ABRE NA PRIMEIRA ABA (O CARTÃO CHAMAVA openCategory('colors') AO CARREGAR); APÓS SALVAR CONTINUA NA MESMA
            setCategoriaAtiva((atual) => (categorias.length === 0 ? null : categorias.includes(atual) ? atual : categorias[0]))

        }

        //SEÇÕES DERIVADAS NO RENDER (useMemo) E NÃO NUM useEffect + setSections: COM O EFFECT, O PRIMEIRO RENDER SAÍA SEM
        //CAMPOS E O <script> DO CARTÃO (output-html, RODA LOGO APÓS ESSE RENDER) LIGAVA $('#Selid_email').change,
        //$('.btt-enviar-email').click... EM ELEMENTOS QUE AINDA NÃO EXISTIAM — FUNCIONAVA OU NÃO CONFORME A CORRIDA
        const sections = useMemo(() => {

            const fields = Array.isArray(data?.form?.fields) ? data.form.fields : []

            const groupedSections = []
            let currentSection = null

            fields.forEach((field) => {

                //Cab COM ATRIBUTO CONDICIONAL (ex.: data-modo-abertura="2" NO CARD DE CLIENTES) NÃO ABRE CARD
                //NOVO: NO PAINEL ANTIGO ELE ERA UMA <tr> DA MESMA TABELA, ESCONDIDA SOZINHA PELO JS DO CARD
                //SEM LEVAR OS CAMPOS SEGUINTES. AQUI VIRA UMA LINHA DE TÍTULO DENTRO DA SEÇÃO ATUAL.
                //data-category NÃO CONTA: É A ABA DA SEÇÃO (VER categoriaDaAba), E CADA Cab DELA É UM CARD PRÓPRIO
                const cabCondicional = field.type === 'Cab' && currentSection &&
                    /\bdata-(?!type=|category=)[\w-]+=/.test(field.row_attr || '')

                if (field.type === 'Cab' && !cabCondicional) {

                    if (currentSection) {
                        groupedSections.push(currentSection)
                    }

                    let subTitle = field?.field?.value?.title?.split('//');
                    let title = field.field.value.title;
                    if(subTitle?.length > 1) {
                        title    = subTitle[0].trim();
                        subTitle = subTitle[1].trim();
                    } else {
                        subTitle = ''
                    }

                    currentSection = {
                        title: title,
                        subTitle: subTitle,
                        number: field.field.value.number,
                        categoria: /\bdata-category=["']?([\w-]+)/.exec(field.row_attr || '')?.[1] || null,
                        fields: [],
                    }

                } else {

                    //CAMPO ANTES DO PRIMEIRO Cab: ABRE UMA SEÇÃO SEM CABEÇALHO EM VEZ
                    //DE DESCARTÁ-LO. O CARD NÃO É OBRIGADO A COMEÇAR COM Cab.
                    if (!currentSection) {
                        currentSection = { title: '', subTitle: '', number: '', fields: [] }
                    }

                    currentSection.fields.push(field)

                }

            })

            if (currentSection) {
                groupedSections.push(currentSection)
            }

            return groupedSections

        }, [ data ]);

        useEffect(() => {
            if (data?.buttons?.form) {
                parseTabs(data.buttons.form)
            }
        }, [ data ]);

        //SEÇÃO DE OUTRA ABA DE CATEGORIA: CONTINUA NO DOM (ESCONDIDA) PARA OS CAMPOS IREM NO ENVIO. O BOTÃO DE SALVAR VAI NA
        //ÚLTIMA SEÇÃO VISÍVEL (NO LEGADO O openCategory SEMPRE MOSTRAVA A ÚLTIMA LINHA, A DO BOTÃO)
        const secaoForaDaCategoria = (secao) =>
            Boolean(categoriaAtiva && secao.categoria && secao.categoria !== 'url' && secao.categoria !== categoriaAtiva)

        const ultimaSecaoVisivel = sections.reduce((ultima, secao, indice) => (secaoForaDaCategoria(secao) ? ultima : indice), sections.length - 1)

        //O LOADER VALE APENAS ENQUANTO A PONTE NÃO RESPONDEU. UM FORMULÁRIO SEM CAMPOS
        //É UM RESULTADO VÁLIDO (CARD COM $lista = false E $array VAZIO, QUE NO PAINEL-PHP
        //MONTA A TELA POR echo) — ANTES ISSO PRENDIA A PÁGINA NO ScreenLoader PARA SEMPRE.
        if (!data) {
            return <ScreenLoader />
        }

        return (
            <div className="grid gap-1 mx-auto">

                {formTabs && (
                    <FormTabs
                        tabs={categoriaAtiva ? { ...formTabs, before: formTabs.before.map((aba) => (aba.categoria ? { ...aba, ativa: aba.categoria === categoriaAtiva } : aba)) } : formTabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                )}

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
                <div>
                    {sections.map((section, index) => (
                        <FormSection
                            key={index}
                            loading={loading}
                            data={section}
                            index={index + 1}
                            button={index === ultimaSecaoVisivel}
                            form={data.form}
                            validRows={validRows}
                            setValidRows={setValidRows}
                            controladores={controladores}
                            oculta={secaoForaDaCategoria(section)}
                            categoriaAtiva={categoriaAtiva}
                        />
                    ))}
                </div>
                )}

                {sections.length > 0 && data?.form?.action !== false && (
                <form
                    //id DO <form> DO LEGADO (framework/formulario.php): O JS DOS CARTÕES ENVIA COM $('#envioConteudo').submit()
                    id="envioConteudo"
                    ref={prepararEnvioLegado}
                    encType="application/x-www-form-urlencoded"
                    onSubmit={submitForm}
                >

                    {acao === 'Inserir' ? (
                        
                        <input
                            type="hidden"
                            name="Inserir"
                            id="Inserir"
                            value={data.form?.hidden_fields?.Inserir}
                        />

                    ) : (
                        <>
                            <input
                                type="hidden"
                                name="Alterar"
                                id="Alterar"
                                value={data.form?.hidden_fields?.Alterar}
                            />
                            <input
                                type="hidden"
                                name="Id"
                                id="Id"
                                value={data.form?.hidden_fields?.id}
                            />
                            {/* name="id" (MINÚSCULO) É O DO framework/formulario.php LEGADO: CARTÕES COM forms() PRÓPRIO LEEM
                                $_POST['id'] (ex.: textos-e-imagens VOLTA PARA &id=$_POST['id'] — SEM ELE A URL FICAVA "&id=") */}
                            <input
                                type="hidden"
                                name="id"
                                id="id"
                                value={data.form?.hidden_fields?.id ?? ''}
                            />
                        </>
                    )}

                    {/* CAMPOS Hdn DECLARADOS PELO CARD — A PONTE OS ENVIA EM form.hidden_fields */}
                    {data.form?.hidden_fields &&
                        Object.entries(data.form.hidden_fields)
                            .filter(([name]) => !['Inserir', 'Alterar', 'id'].includes(name))
                            .map(([name, value]) => (
                                <input
                                    key={`hidden-${name}`}
                                    type="hidden"
                                    name={name}
                                    id={name}
                                    value={value ?? ''}
                                />
                            ))}

                    {sections.map((section, index) => (
                        <FormSection
                            key={index}
                            loading={loading}
                            data={section}
                            index={index + 1}
                            button={index === ultimaSecaoVisivel}
                            form={data.form}
                            validRows={validRows}
                            setValidRows={setValidRows}
                            controladores={controladores}
                            oculta={secaoForaDaCategoria(section)}
                            categoriaAtiva={categoriaAtiva}
                        />
                    ))}

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
