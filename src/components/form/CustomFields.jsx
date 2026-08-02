    import './custom-fields.css'

    // CHECKBOX/RADIO NO ESTILO DO PAINEL-PHP (Forms::createCheckbox/createRadioButton):
    // ícone de 34px com hover circular, caixa de 18px, azul #0075A7 e transição suave.
    // O container é <label>, então o clique alterna o input nativo (que segue no FormData).

    const CHECK_SVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16px"
            height="16px"
            fill="#FFF"
            viewBox="0 0 405.272 405.272"
        >
            <g>
                <path d="M393.401,124.425L179.603,338.208c-15.832,15.835-41.514,15.835-57.361,0L11.878,227.836 c-15.838-15.835-15.838-41.52,0-57.358c15.841-15.841,41.521-15.841,57.355-0.006l81.698,81.699L336.037,67.064 c15.841-15.841,41.523-15.829,57.358,0C409.23,82.902,409.23,108.578,393.401,124.425z" />
            </g>
        </svg>
    )

    const CustomCheckbox = ({ name, value, checked, onChange, label }) => (
        <label data-custom-field="checkbox">
            <input
                type="checkbox"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
            />
            <div className="custom-checkbox">
                <div className="custom-checkbox-icon">
                    <span>{CHECK_SVG}</span>
                </div>
                <span className="text-[13px] text-gray-900">{label}</span>
            </div>
        </label>
    )

    const CustomRadio = ({ name, value, checked, onChange, label }) => (
        <label data-custom-field="radiobutton">
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
            />
            <div className="custom-radiobutton">
                <div className="custom-radiobutton-icon">
                    <span></span>
                </div>
                <span className="text-[13px] text-gray-900">{label}</span>
            </div>
        </label>
    )

    export { CustomCheckbox, CustomRadio }
