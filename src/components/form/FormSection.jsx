import { useState } from 'react'
import { FormInput, FormSelect } from './'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { KeenIcon } from '@/components'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const FormSection = ({ data, index, button, form }) => {
    const [formState, setFormState] = useState({})
    const [date, setDate] = useState(new Date())

    const handleInputChange = (name, value) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (name, value) => {
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
                        subtitle,
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
                        case 'Hdn':
                        case 'Txt':
                        case 'Lis':
                        case 'Arq':
                        case 'Fto':
                        case 'Din':
                        case 'Cor':
                            return (
                                <FormInput
                                    key={fieldName}
                                    type={type}
                                    title={title}
                                    subtitle={subtitle}
                                    fieldName={fieldName}
                                    fieldClass={fieldClass}
                                    fieldData={fieldData}
                                    formState={formState}
                                    required={required}
                                    handleInputChange={handleInputChange}
                                />
                            )
                        case 'Rdo':
                            return (
                                <div
                                    key={field.name}
                                    className="flex items-center flex-wrap lg:flex-nowrap gap-2.5"
                                >
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
                                                    checked={
                                                        formState[item.name] ===
                                                        item.value
                                                    }
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
                                                checked={
                                                    formState[fieldName] ||
                                                    false
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        fieldName,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <label className="form-label pl-2">
                                                {item.title}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )
                        case 'Qnt':
                        case 'Sel':
                        case 'Man':
                            return (
                                <FormSelect
                                    key={fieldName}
                                    field={field}
                                    fieldData={fieldData}
                                    formState={formState}
                                    handleSelectChange={handleSelectChange}
                                />
                            )
                        case 'Dta':
                            return (
                                <div key={fieldName} className="w-full">
                                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                                        <label className="form-label flex items-center gap-1 max-w-56">
                                            {fieldData.title || title}
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    id="date"
                                                    className={cn(
                                                        'input data-[state=open]:border-primary',
                                                        !date &&
                                                            'text-muted-foreground'
                                                    )}
                                                >
                                                    <KeenIcon
                                                        icon="calendar"
                                                        className="-ms-0.5"
                                                    />
                                                    {date ? (
                                                        format(
                                                            date,
                                                            'dd/MM/y'
                                                        )
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    initialFocus
                                                    mode="single"
                                                    defaultMonth={date}
                                                    selected={date}
                                                    onSelect={setDate}
                                                    numberOfMonths={1}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )
                        case 'Cod':
                            return fieldData?.value || '-'
                            break
                        case 'Tab':
                        case 'Mul':
                        case 'Aut':
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
