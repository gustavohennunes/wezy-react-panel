import clsx from 'clsx'

// BARRA DE PROGRESSO DO METRONIC (.progress / .progress-bar) DO USO DE DISCO, NA COR DO NÍVEL (VER utils/usoDeDisco)
const BarraDeUso = ({ percentual, classeDaBarra, className }) => (
    <div
        className={clsx('progress bg-gray-200', classeDaBarra, className)}
        role="progressbar"
        aria-label="Uso do armazenamento"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentual}
    >
        <div className="progress-bar transition-[width]" style={{ width: `${Math.max(percentual, 2)}%` }} />
    </div>
)

export { BarraDeUso }
