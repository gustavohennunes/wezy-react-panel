import { useState } from 'react'
import { FormInput, FormSelect } from './'

const FormSection = ({ data, index, button, form }) => {
    const [formState, setFormState] = useState({})

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
        }));
      };

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
                        case 'Qnt':
                        case 'Sel':
                            return (
                                <FormSelect
                                    key={fieldName}
                                    field={field}
                                    fieldData={fieldData}
                                    formState={formState}
                                    handleSelectChange={handleSelectChange}
                                />
                            );
                        case 'Dta':
                            //Todo componente Data picker
                            return null
                        case 'Cor':
                            //Todo componente color picker
                            return null
                        case 'Tab':
                        case 'Man':
                        case 'Mul':
                        case 'Aut':
                        case 'Cod':                                              
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
