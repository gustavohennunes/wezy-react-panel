import React, { useState } from 'react'
import { KIcon } from '@metronic-partials/icons/KIcon'

const FormIconSelector = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStyle, setSelectedStyle] = useState('Filled')
    const icons = [
        // Lista de ícones (você precisará obter essa lista do Metronic ou Keen Icons)
        { name: 'abstract-33', style: 'Filled' },
        { name: 'abstract-27', style: 'Filled' },
        { name: 'abstract-26', style: 'Filled' },
        // ... outros ícones
    ]

    const filteredIcons = icons.filter((icon) => {
        return icon.name.includes(searchTerm) && icon.style === selectedStyle
    })

    return (
        <div>
            <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
                <label>
                    <input
                        type="radio"
                        value="Filled"
                        checked={selectedStyle === 'Filled'}
                        onChange={() => setSelectedStyle('Filled')}
                    />
                    Filled
                </label>
                <label>
                    <input
                        type="radio"
                        value="Solid"
                        checked={selectedStyle === 'Solid'}
                        onChange={() => setSelectedStyle('Solid')}
                    />
                    Solid
                </label>
                <label>
                    <input
                        type="radio"
                        value="Outline"
                        checked={selectedStyle === 'Outline'}
                        onChange={() => setSelectedStyle('Outline')}
                    />
                    Outline
                </label>
                <label>
                    <input
                        type="radio"
                        value="Duotone"
                        checked={selectedStyle === 'Duotone'}
                        onChange={() => setSelectedStyle('Duotone')}
                    />
                    Duotone
                </label>
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                }}
            >
                {filteredIcons.map((icon) => (
                    <div
                        key={icon.name}
                        onClick={() => onSelect(icon.name)}
                        style={{ cursor: 'pointer' }}
                    >
                        <KIcon iconName={icon.name} iconStyle={icon.style} />
                        <p>{icon.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FormIconSelector
