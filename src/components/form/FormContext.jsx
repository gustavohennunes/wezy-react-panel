    import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
    import { useNavigate } from 'react-router-dom'
    import qs from 'qs'
    import { FormSection } from './'
    import { chaveValid } from './FormSection'
    import { temEditorDeCodigo, instalarEditorGlobal } from './FormCodeEditor'
    import { FormTabs } from './'
    import { ScreenLoader } from '@/components/loaders'
    import { KeenIcon } from '@/components/keenicons'
    import { api } from '@/services/api'
    import { toast } from 'sonner'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { usePageData } from '@/context/PageDataContext'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useLegacyCodeEditor } from './LegacyCodeEditor'
    import { useLegacyModoCriacao } from './LegacyModoCriacao'
    import { findLegacyRedirectDeep, applyLegacyRedirect } from '@/utils/legacyRedirect'

    const FormContext = ({ data }) => {

        const navigate = useNavigate();

        const params = new URLSearchParams(window.location.search);

        const acao = params.get('acao');

        const [ sections, setSections ]      = useState([]);
        const [ formTabs, setFormTabs ]      = useState('');
        const [ loading, setLoading ]        = useState(false);
        const [ activeTab, setActiveTab ]    = useState('');
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

        async function submitForm(e) {

            e.preventDefault();

            let response = '';
            const form = e.target;
            const formData = new FormData(form);
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
            
            tabsArray.forEach((tab) => {
                                    
                let tabUrl  = tab.split('href="')[1];
                    tabUrl  = tabUrl ? tabUrl.split('"')[0] : '';
                let tabName = tab.split('href="')[1];
                    tabName = tabName ? tabName.split('>')[1] : '';

                if (tabUrl) {

                    tabsObject.before.push({
                        content: tabName,
                        url: tabUrl,
                    })

                }

            })
            
            setFormTabs(tabsObject)

        }

        useEffect(() => {

            const fields = Array.isArray(data?.form?.fields) ? data.form.fields : []

            const groupedSections = []
            let currentSection = null

            fields.forEach((field) => {

                //Cab COM ATRIBUTO CONDICIONAL (ex.: data-modo-abertura="2" NO CARD DE CLIENTES) NÃO ABRE CARD
                //NOVO: NO PAINEL ANTIGO ELE ERA UMA <tr> DA MESMA TABELA, ESCONDIDA SOZINHA PELO JS DO CARD
                //SEM LEVAR OS CAMPOS SEGUINTES. AQUI VIRA UMA LINHA DE TÍTULO DENTRO DA SEÇÃO ATUAL.
                const cabCondicional = field.type === 'Cab' && currentSection &&
                    /\bdata-(?!type=)[\w-]+=/.test(field.row_attr || '')

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

            setSections(groupedSections)

            if (data?.buttons?.form) {
                parseTabs(data.buttons.form)
            }

        }, [ data ]);

        //O LOADER VALE APENAS ENQUANTO A PONTE NÃO RESPONDEU. UM FORMULÁRIO SEM CAMPOS
        //É UM RESULTADO VÁLIDO (CARD COM $lista = false E $array VAZIO, QUE NO PAINEL-PHP
        //MONTA A TELA POR echo) — ANTES ISSO PRENDIA A PÁGINA NO ScreenLoader PARA SEMPRE.
        if (!data) {
            return <ScreenLoader />
        }

        return (
            <div className="grid gap-1 mx-auto">

                {formTabs && <FormTabs tabs={formTabs} activeTab={activeTab} setActiveTab={setActiveTab} />}

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
                            button={index === sections.length - 1}
                            form={data.form}
                            validRows={validRows}
                            setValidRows={setValidRows}
                            controladores={controladores}
                        />
                    ))}
                </div>
                )}

                {sections.length > 0 && data?.form?.action !== false && (
                <form
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
                            button={index === sections.length - 1}
                            form={data.form}
                            validRows={validRows}
                            setValidRows={setValidRows}
                            controladores={controladores}
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
