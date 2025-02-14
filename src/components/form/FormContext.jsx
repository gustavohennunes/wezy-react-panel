import { useState } from "react";
import { FormSection } from "./";
import { ScreenLoader } from "@/components/loaders";

const FormContext = ({ data }) => {
    const [sections, setSections] = useState("");

    // TODO FOREACH COM OS DADOS DE SECTION QUE VIER DA API

    return (
        <div className="grid grid gap-5 lg:gap-7.5 mx-auto">
            <FormSection data={data} index={1}/>
            
            <FormSection data={data} index={2}/>

            <FormSection data={data} index={3} button={true}/>
        </div>
    )
}
export { FormContext }
