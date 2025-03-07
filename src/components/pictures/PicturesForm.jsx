import { useState, useEffect } from 'react'
import { ScreenLoader } from '@/components/loaders'
import { FormFile } from '../form/FormFile';
import { FormInput } from '../form/FormInput';

const PicturesForm = ({ data }) => {
    const [sections, setSections] = useState('')
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        
    }, [data])

    const handleFilesChange = (files) => {
        setSelectedFiles(files);
        console.log('Arquivos selecionados:', files);
    };

    const handleInputChange = (name, value) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    if (!sections.length) {
        //return <ScreenLoader />
    }

    return (
        <div className="grid">
            <form action="">
                <FormFile
                    multiple={true}
                    accept="image/*" // Exemplo: aceitar apenas imagens
                    maxSize={5 * 1024 * 1024} // Exemplo: tamanho máximo de 5MB
                    onFilesChange={handleFilesChange}
                />
                <FormInput
                    key={"Link"}
                    type={"Frm"}
                    title={"Link"}
                    fieldName={"Link"}
                    fieldData={fieldData}
                    formState={formState}
                    handleInputChange={handleInputChange}
                />
                <FormInput
                    key={"Legenda"}
                    type={"Frm"}
                    title={"Legenda"}
                    fieldName={"Legenda"}
                    fieldData={fieldData}
                    formState={formState}
                    handleInputChange={handleInputChange}
                />
            </form>
        </div>
    )
}
export { PicturesForm }
