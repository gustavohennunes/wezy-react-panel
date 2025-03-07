import { useState, useEffect } from 'react'
import { ScreenLoader } from '@/components/loaders'

const PicturesGallery = ({ data }) => {
    const [sections, setSections] = useState('')

    useEffect(() => {
        
    }, [data])

    if (!sections.length) {
        //return <ScreenLoader />
    }

    return (
        <div className="grid grid gap-5 lg:gap-7.5 mx-auto">
            
        </div>
    )
}
export { PicturesGallery }
