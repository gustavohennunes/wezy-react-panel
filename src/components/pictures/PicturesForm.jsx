import { useState, useEffect } from 'react'
import { ScreenLoader } from '@/components/loaders'
import { FormFile } from '../form/FormFile';
import { FormInput } from '../form/FormInput';

const PicturesForm = ({ data }) => {
    const [sections, setSections] = useState('')
    const [formState, setFormState] = useState({})
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
        <div className="card grid">
            <form action="">
                <div className="card-body grid gap-5" >
                    <FormFile
                        multiple={true}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        onFilesChange={handleFilesChange}
                    />
                </div>
                <div className="card-body grid gap-5" >
                <FormInput
                    key={"Link"}
                    type={"Frm"}
                    title={"Link"}
                    fieldName={"Link"}
                    fieldData={{
                        "type": "text",
                        "name": "FrmLink",
                        "id": "FrmLink",
                    }}
                    formState={formState}
                    handleInputChange={handleInputChange}
                />
                </div>
                <div className="card-body grid gap-5" >
                <FormInput
                    key={"Legenda"}
                    type={"Frm"}
                    title={"Legenda"}
                    fieldName={"Legenda"}
                    fieldData={{
                        "type": "text",
                        "name": "FrmLegenda",
                        "id": "FrmLegenda",
                    }}
                    formState={formState}
                    handleInputChange={handleInputChange}
                />
                </div>
            </form>
        </div>
    )
}
export { PicturesForm }
