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

    const FormContext = ({ data }) => {

        const navigate = useNavigate()

        const params = new URLSearchParams(window.location.search)
        
        const acao = params.get('acao')
        
        const [ sections, setSections ]      = useState('')
        const [ formTabs, setFormTabs ]      = useState('')
        const [ loading, setLoading ]        = useState(false)
        const [ activeTab, setActiveTab ]    = useState('');
        const { callApi }                    = usePageData()
        const { auth, logout, slug, action } = useAuth()

        async function submitForm(e) {

            e.preventDefault()

            let response = ''
            const form = e.target
            const formData = new FormData(form)
            const formDataObject = {}
            
            formData.forEach((value, key) => {
                
                if (formDataObject[key] !== undefined) {
                    
                    if (!Array.isArray(formDataObject[key])) {
                        formDataObject[key] = [formDataObject[key]]
                    }

                    formDataObject[key].push(value)

                } else {
                    formDataObject[key] = value
                }

            })

            setLoading(true);

            try {

                const urlFormulario = window.location.search
                
                response = await api.post(
                    buildApiUrl(urlFormulario),
                    qs.stringify(formDataObject),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    }
                )

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
                    window.location.href = '/modulos'
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

            if (data?.form?.fields) {

                const fields = data.form.fields
                const groupedSections = []
                let currentSection = null

                fields.forEach((field) => {

                    if (field.type === 'Cab') {

                        if (currentSection) {
                            groupedSections.push(currentSection)
                        }

                        currentSection = {
                            title: field.field.value.title,
                            number: field.field.value.number,
                            fields: [],
                        }

                    } else if (currentSection) {
                        currentSection.fields.push(field)
                    }

                })

                if (currentSection) {
                    groupedSections.push(currentSection)
                }

                setSections(groupedSections)

            }

            if (data?.buttons?.form) {
                parseTabs(data.buttons.form)
            }

        }, [ data ]);

        if (!sections.length) {
            return <ScreenLoader />
        }

        return (
            <div className="grid gap-1 mx-auto">
                
                {formTabs && <FormTabs tabs={formTabs} activeTab={activeTab} setActiveTab={setActiveTab} />}
                
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

                <button type="button" onClick={() => navigate(-1)}>
                    Voltar
                </button>

            </div>
        )

    }

    export { FormContext }
