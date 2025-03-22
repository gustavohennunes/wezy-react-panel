    
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
    import { useState, useEffect } from 'react'

    const FormSelect = ({ field, fieldName, fieldData, formState, handleSelectChange, combinedClass, rowAttr = '', required }) => {

        const [options, setOptions] = useState([])
        
        useEffect(() => {

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

                setOptions(generatedOptions)

            } else if (field.type === 'Sel') {

                setOptions(fieldData.options)

            } else if (field.type === 'Man') {

                setOptions(fieldData.options)

            }

        }, [field, fieldData]);

        return (
            <div className={combinedClass} {...rowAttr}>

                <div className="form-label max-w-56">
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

                <Select
                    value={formState[fieldData.name || field.name] || ''}
                    onValueChange={(value) =>
                        handleSelectChange(fieldData.name || field.name, value)
                    }
                >

                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={options[0]?.label} />
                    </SelectTrigger>

                    <SelectContent className="w-full">
                        {options.map((option, index) => {
                            const value =
                                option.value !== undefined &&
                                option.value !== null &&
                                option.value !== ''
                                    ? option.value
                                    : '-1'
                            return (
                                <SelectItem
                                    key={`${index}-${fieldName}`}
                                    value={value}
                                >
                                    {option.label}
                                </SelectItem>
                            )
                        })}

                    </SelectContent>

                </Select>

                <input
                    type="hidden"
                    name={fieldData.name || field.name}
                    value={formState[fieldData.name || field.name] || ''}
                />

            </div>
        )
    }

    export { FormSelect }
