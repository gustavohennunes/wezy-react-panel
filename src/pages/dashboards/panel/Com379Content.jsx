import { useEffect, useRef, useState } from 'react'
import Chart from 'react-apexcharts'
import { api } from '@/services/api'

// The workspace uses the same authenticated transport as native panel forms.
// No tokens or tenant credentials are placed in server-generated HTML.
export function Com379Content({ data }) {
    const root = useRef(null)
    const [error, setError] = useState('')
    useEffect(() => {
        if (!data.javascript || !root.current) return
        const host = root.current
        let disposed = false
        const request = async (event) => {
            const { action, payload, resolve, reject } = event.detail
            try {
                const response = await api.post(`panel/module?slug=simulador&com_action=${encodeURIComponent(action)}`, payload)
                if (!disposed) resolve(response.data?.success?.response?.data ?? response.data)
            } catch (e) {
                if (!disposed) reject(new Error(e.response?.data?.error?.message || 'Não foi possível concluir a operação.'))
            }
        }
        host.addEventListener('com379-request', request)
        const script = document.createElement('script')
        script.textContent = data.javascript
        host.append(script)
        return () => {
            disposed = true
            const workbench = host.querySelector('#com379-workbench')
            workbench?.dispatchEvent(new Event('com379-dispose'))
            if (workbench) delete workbench.dataset.initialized
            host.removeEventListener('com379-request', request)
            script.remove()
        }
    }, [data])
    if (data.charts) {
        return <div className="com379-financial">
            <p className="mb-5 text-sm">{data.note}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {data.charts.map((card, index) => <section key={index} className="card p-5" style={{ gridColumn: `span ${Math.min(3, card.size)}` }}>
                    <h2 className="text-lg font-semibold mb-3">{card.title}</h2>
                    {card.description && <p className="text-sm text-gray-600 mb-4">{card.description}</p>}
                    <FinancialCard card={card} />
                </section>)}
            </div>
            <style>{'@media(max-width:1023px){.com379-financial .grid>section[style]{grid-column:span 1!important}}'}</style>
        </div>
    }
    return <>
        {error && <p role="alert">{error}</p>}
        <style>{data.css}</style>
        <div ref={root} dangerouslySetInnerHTML={{ __html: data.html }} onError={() => setError('Não foi possível carregar a simulação.')} />
    </>
}

function FinancialCard({ card }) {
    const cell = value => typeof value === 'object' ? value.text ?? value.value : value
    if (card.type === 'numbers') return <div className="flex flex-wrap gap-7">{Object.entries(card.data).map(([label, value]) => <div key={label}><p className="text-sm text-gray-600">{label}</p><strong className="text-2xl">{cell(value)}</strong></div>)}</div>
    if (card.type === 'list' || card.type === 'table') {
        const entries = Object.entries(card.data)
        const headers = card.type === 'list' ? entries[0] : card.data.headers
        const rows = card.type === 'list' ? entries.slice(1) : card.data.rows
        return <div className="overflow-auto"><table className="table"><thead><tr>{headers.map((h, i) => <th key={i}>{cell(h)}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j}>{cell(value)}</td>)}</tr>)}</tbody></table></div>
    }
    const multi = typeof Object.values(card.data)[0] === 'object'
    const categories = multi ? Object.keys(Object.values(card.data)[0]) : Object.keys(card.data)
    const series = card.type === 'pie' ? Object.values(card.data) : multi ? Object.entries(card.data).map(([name, values]) => ({ name, data: Object.values(values) })) : [{ name: 'Valor', data: Object.values(card.data) }]
    return <Chart type={card.type} height={300} series={series} options={{ chart: { toolbar: { show: false } }, labels: categories, xaxis: { categories }, colors: ['#246655', '#769bc0', '#cf8865'], dataLabels: { enabled: card.type === 'pie' }, tooltip: { y: { formatter: v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) } } }} />
}
