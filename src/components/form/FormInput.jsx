import React from 'react'
import { CurrencyInput } from 'react-currency-mask'
import { FormFile } from './'
import { FormColorPicker } from './FormColorPicker'

const FormInput = ({ type, title, subtitle = '', combinedClass, rowAttr, fieldName, fieldClass = '', fieldData, formState, required = false, handleInputChange }) => {

    let inputElement

    const handleFilesChange = (files) => {
        setSelectedFiles(files)
        console.log('Arquivos selecionados:', files)
    }
    
    switch (type) {
        case 'Frm':

            inputElement = (
                <input
                    type={fieldData.type}
                    className={`input ${fieldClass} ${fieldData.class}`}
                    name={fieldName}
                    value={formState[fieldName] || ''}
                    required={required}
                    onChange={(e) =>
                        handleInputChange(fieldName, e.target.value)
                    }
                />
            )

        break
        case 'Val':

            inputElement = (
                <CurrencyInput
                    onChangeValue={(event, originalValue, maskedValue) => {
                        
                    }}
                    defaultValue={formState[fieldName] || 0}
                    value={formState[fieldName] || 0}
                    InputElement={
                        <input
                            type={fieldData.type}
                            className={`input ${fieldClass} ${fieldData.class}`}
                            name={fieldName}
                            value={formState[fieldName] || 0}
                            required={required}
                            onChange={(e) =>
                                handleInputChange(fieldName, e.target.value)
                            }
                        />
                    }
                />
            )

        break
        case 'Psw':

            inputElement = (
                <div
                    className={`input ${fieldClass} ${fieldData.class}`}
                    data-toggle-password="true"
                >
                    <input
                        name={fieldName}
                        type="password"
                        required={required}
                        onChange={(e) =>
                            handleInputChange(fieldName, e.target.value)
                        }
                    />
                    <div
                        className="btn btn-icon"
                        data-toggle-password-trigger="true"
                    >
                        <i className="ki-outline ki-eye toggle-password-active:hidden"></i>
                        <i className="ki-outline ki-eye-slash hidden toggle-password-active:block"></i>
                    </div>
                </div>
            )

        break
        case 'Hdn':

            inputElement = (
                <input
                    type="hidden"
                    className={`input ${fieldClass}`}
                    name={fieldName}
                    value={formState[fieldName] || ''}
                    required={required}
                    onChange={(e) =>
                        handleInputChange(fieldName, e.target.value)
                    }
                />
            )

        break
        case 'Txt':

            inputElement = (
                <textarea
                    className={`input min-h-[120px] ${fieldClass} ${fieldData.class}`}
                    name={fieldName}
                    value={formState[fieldName] || ''}
                    required={required}
                    onChange={(e) =>
                        handleInputChange(fieldName, e.target.value)
                    }
                />
            )

        break
        case 'Lis':

            inputElement = (
                <div className={fieldData.class + ' text-[13px]'}>
                    {fieldData.value}
                    {fieldData.extra_html}
                </div>
            )

        break
        case 'Fto':

            inputElement = (
                <FormFile
                    fieldName={fieldName}
                    multiple={true}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    onFilesChange={handleFilesChange}
                />
            )

        break
        case 'Arq':

            inputElement = (
                <FormFile
                    fieldName={fieldName}
                    multiple={true}
                    accept="*"
                    maxSize={5 * 1024 * 1024}
                    onFilesChange={handleFilesChange}
                />
            )

        break
        case 'Din':

            inputElement = (
                <div className={fieldData.class + ' text-[13px]'}>
                    {fieldData.extra_html}
                </div>
            )

        break
        case 'aut':

            inputElement = (
                <div className={fieldData.class + ' text-[13px]'}>
                    <span
                        style={{ display: 'contents' }}
                        dangerouslySetInnerHTML={{
                            __html: fieldData.extra_html,
                        }}
                    ></span>
                </div>
            )

        break
        case 'Cor':

            inputElement = (
                <FormColorPicker
                    color={formState[fieldName]}
                    onChange={(color) => handleInputChange(fieldName, color)}
                />
            )

        break
        default:
            inputElement = null
        break
    }

    let requiredField = false
    if ((fieldClass + fieldData.class).indexOf('obg') !== -1) {
        requiredField = true
    }

    return (
        <div className={combinedClass} {...rowAttr}>
            <div className="form-label max-w-56 flex-col">
                <label>
                    <b>
                        {title}
                        {requiredField && (
                            <span className="text-danger"> *</span>
                        )}
                    </b>
                </label>
                {subtitle && <span className="text-[10px]"> {subtitle} </span>}
            </div>
            {inputElement}
        </div>
    )
}

export { FormInput }
