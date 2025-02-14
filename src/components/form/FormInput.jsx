const FormInput = ({ data, nameInput }) => {
    return (
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex gap-1 max-w-56">
                Nome completo
                <span className="text-danger">*</span>
            </label>
            <input
                className="input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
            />
        </div>
    )
}
export { FormInput }
