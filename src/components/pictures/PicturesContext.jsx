import { useState, useEffect } from 'react'
import { PicturesGallery } from './'
import { PicturesForm } from './'
import { ScreenLoader } from '@/components/loaders'

const PicturesContext = ({ data }) => {
    const [sections, setSections] = useState('')

    useEffect(() => {
        
    }, [data])

    if (!sections.length) {
        //return <ScreenLoader />
    }

    return (
        <div className="grid grid gap-5 lg:gap-7.5 mx-auto">
            <PicturesForm data={data}></PicturesForm>
        </div>
    )
}
export { PicturesContext }
