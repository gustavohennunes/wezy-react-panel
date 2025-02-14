import { useState } from 'react'
import { FormInput } from './'

const FormSection = ({ data, index, button }) => {
    const [nameInput, setNameInput] = useState('Douglas Feuser')
    const [emailInput, setEmailInput] = useState('douglas@cayman.com')

    let inputs = ''
    if (true) {
        inputs = <FormInput data={data} nameInput={nameInput}/>
    }

    let endButton = ''
    if (button) {
        endButton = (
            <div className="flex justify-start">
                <button className="btn btn-success">Enviar</button>
            </div>
        )
    }
    return (
        <div className="card pb-2.5">
            <div className="card-header justify-start" id="general_settings">
                <span className="badge badge-primary mr-[8px]">0{index}</span>
                <h3 className="card-title">{data.title}</h3>
            </div>
            <div className="card-body grid gap-5">
                {inputs}

                <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Login</label>
                    <input type="text" className="input" placeholder="Login" />
                </div>

                <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Email</label>
                    <input
                        className="input"
                        type="text"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                </div>

                {endButton}
            </div>
        </div>
    )
}
export { FormSection }
