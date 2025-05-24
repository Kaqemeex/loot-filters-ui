import { Alert, Container, Snackbar } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FilterSelector } from './components/FilterSelector'
import { InfoDialog } from './components/InfoDialog'
import { initImages } from './images/osrs/imageUtils'
import { CustomizeFilterPageBody } from './pages/CustomizeFilterPage'
import { DebugPage } from './pages/DebugPage'
import { EditorLoadedFilterPage } from './pages/EditLoadedFilterPage'
import { HelpPage } from './pages/HelpPage'
import { ImportPage } from './pages/ImportPage'
import { NewFilterPage } from './pages/NewFilterPage'
import { useAlertStore } from './store/alerts'
import {
    MigrateLegacyData,
    requiresMigration,
} from './store/migrations/MigrateLegacyData'
import { MuiRsTheme } from './styles/MuiTheme'

const Page: React.FC<{
    component?: ReactNode
}> = ({ component }) => {
    const params = new URLSearchParams(window.location.search)
    initImages()

    const alerts = useAlertStore((state) => state.alerts)
    const isAlerts = Boolean(alerts.length)
    const closeAlert = useAlertStore((state) => state.removeAlert)

    return (
        <Container className="rs-container" maxWidth="xl">
            {alerts.map((alert, i) => (
                <Snackbar
                    key={i}
                    open={isAlerts}
                    autoHideDuration={2000}
                    onClose={() => closeAlert(0)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert {...alert} />
                </Snackbar>
            ))}
            <ErrorBoundary>
                <AppHeader />
            </ErrorBoundary>
            {component}
        </Container>
    )
}

export const App = () => {
    const doMigration = requiresMigration()
    if (doMigration && window.location.pathname !== '/debug') {
        return (
            <ThemeProvider theme={MuiRsTheme}>
                <MigrateLegacyData />
            </ThemeProvider>
        )
    }

    return (
        <ThemeProvider theme={MuiRsTheme}>
            <span style={{ display: 'none', fontFamily: 'RuneScape' }}>
                runescape
            </span>
            <span style={{ display: 'none', fontFamily: 'RuneScapeBold' }}>
                RuneScapeBold
            </span>
            <span style={{ display: 'none', fontFamily: 'RuneScapeSmall' }}>
                RuneScapeSmall
            </span>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/debug"
                        element={<Page component={<DebugPage />} />}
                    />
                    <Route
                        path="/"
                        element={
                            <Page
                                component={
                                    <ErrorBoundary
                                        beforeErrorComponent={
                                            <FilterSelector
                                                reloadOnChange={true}
                                            />
                                        }
                                    >
                                        <CustomizeFilterPageBody />
                                    </ErrorBoundary>
                                }
                            />
                        }
                    />
                    <Route
                        path="/editor/:filterId"
                        element={
                            <Page component={<EditorLoadedFilterPage />} />
                        }
                    />
                    <Route
                        path="/new-filter"
                        element={<Page component={<NewFilterPage />} />}
                    />
                    <Route
                        path="/import"
                        element={<Page component={<ImportPage />} />}
                    />
                    <Route
                        path="/help"
                        element={<Page component={<HelpPage />} />}
                    />
                    <Route path="/save-me" element={<div />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            <InfoDialog />
        </ThemeProvider>
    )
}

export default App
