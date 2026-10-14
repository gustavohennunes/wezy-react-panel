    
    import { useMemo } from 'react'
    import { Combobox } from './FormCombobox'

    const FormSelect = ({ field, fieldData, formState, handleSelectChange, combinedClass, rowAttr = '', required }) => {

        //OPÇÕES DERIVADAS DAS PROPS (useMemo): ANTES FICAVAM EM STATE PREENCHIDO POR useEffect, E O
        //CAMPO RENDERIZAVA UMA VEZ VAZIO ANTES DE MOSTRAR AS OPÇÕES
        const options = useMemo(() => {

            if (field.type === 'Qnt') {

                const maxValue = 12
                const step = 1
                const generatedOptions = []
                if (fieldData.options.length == 1) {

                    generatedOptions.push({
                        value: 0,
                        label: fieldData.options[0].label,
                    })

                    for (let i = 1; i <= maxValue; i += step) {
                        generatedOptions.push({ value: i, label: i })
                    }

                } else {

                    for (let i = 0; i <= maxValue; i += step) {
                        generatedOptions.push({ value: i, label: i })
                    }

                }

                return generatedOptions

            }

            if (field.type === 'Sel') {
                return fieldData.options || []
            }

            if (field.type === 'Man' || field.type === 'Ico') {
                return fieldData.options || []
            }

            return []

        }, [field.type, fieldData.options]);
        
        return (
            <div className={combinedClass} {...rowAttr}>

                <div className="form-label flex flex-col w-full lg:w-56 lg:min-w-56 lg:shrink-0 h-full justify-center">
                    <b>
                        {fieldData.title || field.title}
                        {required && (
                            <span className="text-danger"> {' '} *</span>
                        )}
                    </b>
                    {(fieldData.subtitle || field.subtitle) && (
                        <span className="text-[10px]">
                            {' '}
                            {fieldData.subtitle || field.subtitle}{' '}
                        </span>
                    )}
                </div>

                <Combobox
                    ariaLabel={fieldData.title || field.title || undefined}
                    options={options}
                    value={formState[fieldData.name || field.name] ?? ''}
                    placeholder={options[0]?.label}
                    onChange={(value) => {
                        //OPÇÃO SEM VALOR ("Selecione uma opção") VAI COMO '-1', QUE O handleSelectChange GRAVA VAZIO
                        handleSelectChange(fieldData.name || field.name, value === '' || value === null || value === undefined ? '-1' : String(value))
                    }}
                />

                <input
                    type="hidden"
                    name={fieldData.name || field.name}
                    value={formState[fieldData.name || field.name] || ''}
                />

            </div>
        )
    }

    export { FormSelect }
