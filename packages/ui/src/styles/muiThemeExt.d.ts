import '@mui/material'

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        'main-action': true
    }
}
