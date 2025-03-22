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

        const [sections, setSections] = useState('')
        const params = new URLSearchParams(window.location.search)
        const acao = params.get('acao')

        const { callApi } = usePageData()
        const { auth, logout } = useAuth()
        const navigate = useNavigate()

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
        }, [data])

        if (!sections.length) {
            return <ScreenLoader />
        }

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

            try {

                const urlFormulario = window.location.search
                
                response = await api.post(
                    buildApiUrl(urlFormulario),
                    qs.stringify(formDataObject),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )

                const slug = params.get('slug') ?? params.get('pag')
                params.delete('acao')
                params.delete('id')
                const urlRefresh = buildApiUrl(params)

                callApi(urlRefresh)
                
                toast(`Sucesso!`, {
                    description: response?.data?.success?.response?.data?.message,
                })

            } catch (error) {
                
                toast(`❌ Erro: `, {
                    description: error.response?.data?.error?.message || error.message,
                })

                if (error.status == 401) {
                    logout()
                }

            }

        }

        return (
            <div className="grid gap-5 lg:gap-7.5 mx-auto">
                
                {data.tabs && <FormTabs tabs={data.tabs} />}
                
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
