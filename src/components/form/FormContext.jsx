import { useState, useEffect } from 'react'
import { FormSection } from './'
import { ScreenLoader } from '@/components/loaders'
import { api } from '@/services/api'
import { buildApiUrl } from '@/utils/urlHelper'

const FormContext = ({ data }) => {
    const [sections, setSections] = useState('')

    useEffect(() => {
        if (data?.form?.fields) {
            const fields = data.form.fields
            const groupedSections = []
            let currentSection = null

            fields.forEach((field) => {
                if (field.type === 'Cab') {
                    // Se encontrou um novo "Cab", inicia uma nova seção
                    if (currentSection) {
                        groupedSections.push(currentSection)
                    }
                    currentSection = {
                        title: field.field.value.title,
                        number: field.field.value.number,
                        fields: [],
                    }
                } else if (currentSection) {
                    // Adiciona os campos filhos dentro da seção atual
                    currentSection.fields.push(field)
                }
            })

            // Adiciona a última seção ao array
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

        const inserirValue = formData.get('Inserir')

        for (const pair of formData.entries()) {
            console.log(pair[0], pair[1])
        }

        /* console.log(e)
        console.log(window.location)
        console.log(window.location.search)
        console.log('TESTE') */

        try {
            const params = new URLSearchParams(window.location.search)
            const slug = params.get('slug') ?? params.get('pag')
            const urlFormulario = `?slug=${slug}&acao=Inserir`

            response = await api.post(buildApiUrl(urlFormulario), formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            console.log('Resposta da API:', response);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="grid grid gap-5 lg:gap-7.5 mx-auto">
            <form encType="application/x-www-form-urlencoded" onSubmit={submitForm}>
                <input
                    type="hidden"
                    name={'Inserir'}
                    id={'Inserir'}
                    value={data.form?.hidden_fields?.Inserir}
                />
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
        </div>
    )
}
export { FormContext }
