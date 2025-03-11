import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'

const FormSelect = ({ field, fieldData, formState, handleSelectChange }) => {
    const [options, setOptions] = useState([])

    useEffect(() => {
        if (field.type === 'Qnt') {
            const maxValue = 12
            const step = 1
            const generatedOptions = []
            if(fieldData.options.length == 1 ){
                generatedOptions.push({ value: 0, label: fieldData.options[0].label })
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
    }, [field, fieldData])

    return (
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">
                {fieldData.title || field.title}
            </label>
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
                            option.value !== undefined && option.value !== null &&  option.value !== ''
                                ? option.value
                                : index
                        return (
                            <SelectItem key={index} value={value}>
                                {option.label}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}

export { FormSelect }
