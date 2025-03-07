import React from 'react';

const FormInput = ({
  type,
  title,
  fieldName,
  fieldClass = '',
  fieldData,
  formState,
  required = false,
  handleInputChange,
}) => {
  let inputElement;

  switch (type) {
    case 'Frm':
    case 'Psw':
    case 'Val':
      inputElement = (
        <input
          type={fieldData.type}
          className={`input ${fieldClass} ${fieldData.class}`}
          name={fieldName}
          placeholder={title}
          value={formState[fieldName] || ''}
          required={required}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
        />
      );
      break;
    case 'Hdn':
      inputElement = (
        <input
          type="hidden"
          className={`input ${fieldClass}`}
          name={fieldName}
          placeholder={title}
          value={formState[fieldName] || ''}
          required={required}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
        />
      );
      break;
    case 'Txt':
      inputElement = (
        <textarea
          className={`input min-h-[120px] ${fieldClass} ${fieldData.class}`}
          name={fieldName}
          placeholder={title}
          value={formState[fieldName] || ''}
          required={required}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
        />
      );
      break;
    case 'Lis':
      inputElement = (
        <div className={fieldData.class}>
          {fieldData.value}
          {fieldData.extra_html}
        </div>
      );
      break;
    default:
      inputElement = null;
  }

  return (
    <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
      <label className="form-label max-w-56">{title}</label>
      {inputElement}
    </div>
  );
};

export { FormInput };
