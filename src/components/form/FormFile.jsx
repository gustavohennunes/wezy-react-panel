    import React, { useState } from 'react'

    const FormFile = ({ id, multiple, accept, maxSize, onFilesChange, fieldName, value, fieldClass = '', fieldData = {}, required = false }) => {
        const [selectedFiles, setSelectedFiles] = useState([])
        const [error, setError] = useState(null)

        const handleFileChange = (event) => {

            const files = Array.from(event.target.files)

            if (maxSize && files.some((file) => file.size > maxSize)) {
                setError(`Um ou mais arquivos excedem o tamanho máximo permitido.`)
                return
            }

            setSelectedFiles(files)
            setError(null)
            if (onFilesChange) {
                onFilesChange(files)
            }

        }

        const getFileInputClassName = () => {

            let className = 'file-input'

            if (error) {
                className += ' border-danger'
            } else if (selectedFiles.length > 0) {
                className += ' border-success'
            }

            return className

        }

        return (
            <div className="w-full">
                
                {value && (
                    <img src={value} alt="Imagem" className="w-10 h-10 object-cover rounded-lg mb-2" />
                )}

                <input
                    id={id}
                    name={fieldName}
                    className={
                        getFileInputClassName() + `${fieldClass} ${fieldData.class}`
                    }
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    required={required}
                    onChange={handleFileChange}
                />

            </div>
        )

    }

    export { FormFile }
