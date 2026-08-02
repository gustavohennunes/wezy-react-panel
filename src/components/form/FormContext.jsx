    import { useState, useEffect } from 'react'
    import { useNavigate } from 'react-router-dom'
    import qs from 'qs'
    import { FormSection } from './'
    import { FormTabs } from './'
    import { ScreenLoader } from '@/components/loaders'
    import { api } from '@/services/api'
    import { toast } from 'sonner'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { usePageData } from '@/context/PageDataContext'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useLegacyCodeEditor } from './LegacyCodeEditor'
    import { findLegacyRedirectDeep, applyLegacyRedirect } from '@/utils/legacyRedirect'

    const FormContext = ({ data }) => {

        const navigate = useNavigate();

        const params = new URLSearchParams(window.location.search);

        const acao = params.get('acao');

        const [ sections, setSections ]      = useState([]);
        const [ formTabs, setFormTabs ]      = useState('');
        const [ loading, setLoading ]        = useState(false);
        const [ activeTab, setActiveTab ]    = useState('');
        const { callApi }                    = usePageData();
        const { auth, logout, slug, action } = useAuth();

        //ATIVA O EDITOR ACE NOS CARDS DE CÓDIGO (ex.: ?pag=modulos) — NO-OP NOS DEMAIS
        useLegacyCodeEditor(data);

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

                params.delete('acao')
                params.delete('id')

                const urlRefresh = buildApiUrl(params)
                
                callApi(urlRefresh)
                
                toast(`✅ Sucesso!`, {
                    description: <span style={{'color':'white'}}>{response?.data?.success?.response?.data?.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-success',
                        fontWeight: 'bold'
                    }
                });

                setLoading(false);

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
                        fontWeight: 'bold'
                    }
                })

                setLoading(false);

                if (error.status == 401) {
                    logout()
                }

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

                if (field.type === 'Cab') {

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
                {sections.length > 0 && (
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
                        />
                    ))}

                </form>
                )}

                <button type="button" onClick={() => navigate(-1)}>
                    Voltar
                </button>

            </div>
        )

    }

    export { FormContext }
