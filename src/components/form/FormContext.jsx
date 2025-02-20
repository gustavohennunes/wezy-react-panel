import { useState, useEffect } from 'react'
import { FormSection } from './'
import { ScreenLoader } from '@/components/loaders'

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

    return (
        <div className="grid grid gap-5 lg:gap-7.5 mx-auto">
            {sections.map((section, index) => (
                <FormSection
                    key={index}
                    data={section}
                    index={index + 1}
                    button={index === sections.length - 1}
                    form={data.form}
                />
            ))}
        </div>
    )
}
export { FormContext }
