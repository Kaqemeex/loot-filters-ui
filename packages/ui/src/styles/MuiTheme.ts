import { createTheme } from '@mui/material'

export const colors = {
    rsRed: '#b74343',
    rsLightRed: '#f74343',
    rsYellow: '#ffff00',
    rsDarkYellow: '#dcbe2c',
    rsOrange: '#ff9300',
    rsDarkOrange: '#bba990', // '#b2813d',
    rsDarkBrown: '#2c2721',
    rsLightDarkBrown: '#3d3429',
    rsLightBrown: '#564e43',
    rsLighterBrown: '#706657',
    rsLightestBrown: '#d7c9b5',
    rsMediumBrown: '#4a4036',
    rsWhite: '#ffffff',
    rsBlack: '#000000',
    rsHerbGreen: '#00c000',

    rsGrey: '#808080',
}

const typography = {
    fontFamily: 'RuneScape',
}

export const MuiRsTheme = createTheme({
    components: {
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiTypography: {
            variants: [
                {
                    props: { variant: 'subtitle2' },
                    style: {
                        color: colors.rsGrey,
                    },
                },
            ],
        },
        MuiButton: {
            variants: [
                {
                    props: { variant: 'main-action' },
                    style: {
                        borderWidth: 1,
                        borderStyle: 'solid',
                        color: colors.rsHerbGreen,
                        borderColor: colors.rsHerbGreen,
                        backgroundColor: colors.rsDarkBrown,
                    },
                },
            ],
        },
    },
    typography: {
        fontFamily: 'RuneScape',
        fontSize: 18,
    },
    palette: {
        primary: {
            main: colors.rsOrange,
            contrastText: colors.rsGrey,
        },
        secondary: {
            main: colors.rsYellow,
            contrastText: colors.rsGrey,
        },
        background: {
            default: colors.rsDarkBrown,
            paper: colors.rsLightDarkBrown,
        },
        divider: colors.rsWhite,
        text: {
            primary: colors.rsOrange,
            secondary: colors.rsDarkOrange,
            disabled: '#cccccc',
        },
        common: {
            black: colors.rsBlack,
            white: colors.rsWhite,
        },
        mode: 'dark',
    },
})
