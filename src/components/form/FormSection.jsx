import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FormInput } from './'

const FormSection = ({ data, index, button, form }) => {
    const [formState, setFormState] = useState({})
    const [selectedValue, setSelectedValue] = useState('')

    const handleInputChange = (name, value) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div className="card pb-2.5">
            <div className="card-header justify-start" id="general_settings">
                <span className="badge badge-primary mr-[8px]">0{index}</span>
                <h3 className="card-title">{data.title}</h3>
            </div>
            <div className="card-body grid gap-5">
                {data.fields.map((field, idx) => {
                    const {
                        type,
                        title,
                        field: fieldData,
                        required,
                        name,
                        fieldClass,
                    } = field
                    const fieldName = fieldData?.name || name

                    if (!fieldData) return null

                    switch (type) {
                        case 'Frm':
                        case 'Psw':
                        case 'Val':
                            return (
                                <div
                                    key={idx}
                                    className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {title}
                                    </label>
                                    <input
                                        type={fieldData.type}
                                        className={
                                            'input ' +
                                            fieldClass +
                                            ' ' +
                                            fieldData.class
                                        }
                                        name={fieldName}
                                        placeholder={title}
                                        value={formState[fieldName] || ''}
                                        required={required}
                                        onChange={(e) =>
                                            handleInputChange(
                                                fieldName,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            )
                        case 'Hdn':
                            return (
                                <div
                                    key={idx}
                                    className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {title}
                                    </label>
                                    <input
                                        type={'hidden'}
                                        className={'input ' + fieldClass}
                                        name={fieldName}
                                        placeholder={title}
                                        value={formState[fieldName] || ''}
                                        required={required}
                                        onChange={(e) =>
                                            handleInputChange(
                                                fieldName,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            )
                        case 'Txt':
                            return (
                                <div
                                    key={idx}
                                    className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {title}
                                    </label>
                                    <textarea
                                        type={fieldData.type}
                                        className={
                                            'input min-h-[120px] ' +
                                            fieldClass +
                                            ' ' +
                                            fieldData.class
                                        }
                                        name={fieldName}
                                        placeholder={title}
                                        value={formState[fieldName] || ''}
                                        required={required}
                                        onChange={(e) =>
                                            handleInputChange(
                                                fieldName,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            )
                        case 'Lis':
                            return (
                                <div
                                    key={idx}
                                    className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {title}
                                    </label>
                                    <div className={fieldData.class}>
                                        {fieldData.value}
                                        {fieldData.extra_html}
                                    </div>
                                </div>
                            )
                        case 'Dta':
                        case 'Cod':
                        case 'Din':
                        case 'Cor':
                        case 'Rdo':
                        case 'Qnt':
                        case 'Ckb':
                            return (
                                <div
                                    key={idx}
                                    className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {fieldData.title || title}
                                    </label>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name={fieldName}
                                        checked={formState[fieldName] || false}
                                        onChange={(e) =>
                                            handleInputChange(
                                                fieldName,
                                                e.target.checked
                                            )
                                        }
                                    />
                                </div>
                            )

                        case 'Sel':
                            return (
                                <div
                                    key={idx}
                                    className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {fieldData.title || title}
                                    </label>
                                    <Select
                                        value={selectedValue}
                                        onValueChange={setSelectedValue}
                                    >
                                        <SelectTrigger
                                            className="w-28"
                                            size="sm"
                                        >
                                            <SelectValue>
                                                {selectedValue
                                                    ? fieldData.options.find(
                                                          (opt) =>
                                                              opt.value ===
                                                              selectedValue
                                                      )?.lable || selectedValue
                                                    : 'Select'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="w-32">
                                            {fieldData.options.map(
                                                (option, idoption) => (
                                                    <SelectItem
                                                        key={
                                                            option.id ||
                                                            idoption
                                                        }
                                                        value={
                                                            option.value || 0
                                                        }
                                                    >
                                                        {option.lable}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        case 'Tab':
                        case 'Man':
                        case 'Mul':
                        case 'Aut':
                        case 'Fto':
                        case 'Arq':
                        default:
                            return null
                    }
                })}

                {button && (
                    <div className="flex justify-start">
                        <button className="btn btn-success">
                            {form.submit_button}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export { FormSection }
