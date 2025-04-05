import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/styles.css'

try {
    const localState = localStorage.getItem('modular-filter-storage')
    if (!localState) {
        const defaultLocalState = require('./default-local-state.json')
        localStorage.setItem(
            'modular-filter-storage',
            JSON.stringify(defaultLocalState)
        )
    }
} catch {}

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')
const root = createRoot(container)

root.render(<App />)
