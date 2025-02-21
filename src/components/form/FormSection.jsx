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
            <div className="card-body grid gap-5" >
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
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
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
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
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
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
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
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
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
                        case 'Rdo':
                            return (
                                <div key={field.name} className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
                                    <div className="form-label max-w-56">
                                        {title}
                                    </div>
                                    <div className="flex flex-col gap-3.5">
                                        {fieldData.map((item, index) => (
                                            <label
                                                key={index}
                                                className="form-label flex items-center gap-2.5"
                                            >
                                                <input
                                                    className="radio radio-sm"
                                                    name={item.name}
                                                    id={item.id}
                                                    checked={formState[item.name] === item.value}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            fieldName,
                                                            e.target.value
                                                        )
                                                    }
                                                    type="radio"
                                                    value={item.value}
                                                />
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-2sm font-medium text-gray-600">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )
                        case 'Ckb':
                            console.log(fieldData)
                            return (
                                <div
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
                                >
                                    <label className="form-label max-w-56">
                                        {fieldData.title || title}
                                    </label>
                                    {fieldData.map((item, index) => (
                                        <div className="flex" key={index}>
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
                                            <label className="form-label pl-2">{item.title}</label>
                                        </div>
                                    ))}
                                </div>
                            )

                        case 'Sel':
                            return (
                                <div
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
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
                        case 'Dta':
                            //Todo componente Data picker
                            return null
                        case 'Arq':
                        case 'Fto':
                            //Todo componente Foto
                            return null
                        case 'Cor':
                            //Todo componente color picker
                            return null
                        case 'Tab':
                        case 'Man':
                        case 'Mul':
                        case 'Aut':
                        case 'Cod':
                        case 'Din':
                        case 'Qnt':
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
