import { createTheme } from '@mui/material/styles'

// OSRS Wiki color palette based on https://oldschool.runescape.wiki/w/RuneScape:Theme
const osrsColors = {
    // Body colors
    bodyBorder: '#94866d',
    bodyDark: '#b8a282',
    bodyMid: '#d0bd97',
    bodyLight: '#d8ccb4',
    bodyMain: '#e2dbc8',
    bodyBackground: '#c0a886',

    // Button and link colors
    buttonBorder: '#3c352a',
    buttonDark: '#18140c',
    buttonLight: '#3a301d',
    osrswBrown: '#605443',
    linkColor: '#936039',
    backgroundLinkColor: '#52351e',

    // Gray colors
    mineshaft: '#333333',
    tundora: '#4c4c4c',
    boulder: '#777777',
    silver: '#cccccc',
    gallery: '#eeeeee',
    alabaster: '#f9f9f9',

    // Status colors
    mocaccino: '#801c13',
    oldBrick: '#9f261e',
    flamingo: '#ee4231',
    apricotPeach: '#fbc0ba',
    bridesmaid: '#feecea',
    antiqueBronze: '#7a3f08',
    korma: '#b55e0c',
    ecstasy: '#f7861b',
    corvette: '#fbcfa6',
    lace: '#fef0e4',
    cinnamon: '#786300',
    olive: '#a48900',
    supernova: '#f9d000',
    golden: '#fcea94',
    halfDutch: '#fef9de',
    sanFelix: '#2e5e05',
    laPalma: '#3c780a',
    lima: '#6bc71f',
    caper: '#c3e8a3',
    frost: '#ecf8e3',
    regalBlue: '#03436b',
    veniceBlue: '#0b5884',
    curiousBlue: '#3ea6e6',
    jordyBlue: '#aad9f5',
    tropicalBlue: '#e5f3fc',
    honeyFlower: '#3d276b',
    seance: '#4f348b',
    mediumPurple: '#855cd8',
    perfume: '#cfc0f0',
    heliotrope: '#f0ecfa',
    cosmic: '#6d3662',
    cannonPink: '#984c89',
    lavender: '#e874cf',
    cherub: '#f5c8ec',
    frenchLilac: '#fceef9',
    riverBed: '#444e5a',
    shuttleGray: '#5d6773',
    grayChateau: '#949eaa',
    mystic: '#e4eaee',
    blackHaze: '#f9fafa',

    // Dark mode colors
    blackPearl: '#071022',
    bigStone: '#172136',
    cloudBurst: '#222e45',
    pickledBluewood: '#313e59',
    waikawaGrey: '#596e96',
    portage: '#8cabe6',
    ebonyBrown: '#1b1612',
    mochaBrown: '#28221d',
    cacaoBrown: '#312a25',
    sableBrown: '#3e362f',
    taupeBrown: '#736559',
    kharidSand: '#b79d7e',
}

export const MuiRsTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: osrsColors.ecstasy, // Orange/amber color
            light: osrsColors.corvette,
            dark: osrsColors.korma,
            contrastText: osrsColors.buttonDark,
        },
        secondary: {
            main: osrsColors.curiousBlue, // Blue color
            light: osrsColors.jordyBlue,
            dark: osrsColors.regalBlue,
            contrastText: osrsColors.alabaster,
        },
        success: {
            main: osrsColors.lima, // Green color
            light: osrsColors.caper,
            dark: osrsColors.sanFelix,
            contrastText: osrsColors.buttonDark,
        },
        warning: {
            main: osrsColors.supernova, // Yellow color
            light: osrsColors.golden,
            dark: osrsColors.cinnamon,
            contrastText: osrsColors.buttonDark,
        },
        error: {
            main: osrsColors.flamingo, // Red color
            light: osrsColors.apricotPeach,
            dark: osrsColors.mocaccino,
            contrastText: osrsColors.alabaster,
        },
        info: {
            main: osrsColors.mediumPurple, // Purple color
            light: osrsColors.perfume,
            dark: osrsColors.seance,
            contrastText: osrsColors.alabaster,
        },
        background: {
            default: osrsColors.bodyBackground,
            paper: osrsColors.bodyMain,
        },
        text: {
            primary: osrsColors.buttonDark,
            secondary: osrsColors.boulder,
        },
        divider: osrsColors.bodyBorder,
    },
    typography: {
        fontFamily:
            '"RuneScape", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily:
                '"RuneScapeBold", "RuneScape", "Georgia", "Times", serif',
            color: osrsColors.buttonDark,
            fontWeight: 'bold',
        },
        h2: {
            fontFamily:
                '"RuneScapeBold", "RuneScape", "Georgia", "Times", serif',
            color: osrsColors.buttonDark,
            fontWeight: 'bold',
        },
        h3: {
            fontFamily:
                '"RuneScapeBold", "RuneScape", "Georgia", "Times", serif',
            color: osrsColors.buttonDark,
            fontWeight: 'bold',
        },
        h4: {
            fontFamily:
                '"RuneScapeBold", "RuneScape", "Georgia", "Times", serif',
            color: osrsColors.buttonDark,
            fontWeight: 'bold',
        },
        h5: {
            fontFamily:
                '"RuneScapeBold", "RuneScape", "Georgia", "Times", serif',
            color: osrsColors.buttonDark,
            fontWeight: 'bold',
        },
        h6: {
            fontFamily:
                '"RuneScapeBold", "RuneScape", "Georgia", "Times", serif',
            color: osrsColors.buttonDark,
            fontWeight: 'bold',
        },
        body1: {
            fontFamily:
                '"RuneScape", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
            color: osrsColors.buttonDark,
        },
        body2: {
            fontFamily:
                '"RuneScape", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
            color: osrsColors.boulder,
        },
        button: {
            fontFamily:
                '"RuneScape", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
            textTransform: 'none',
            fontWeight: 600,
        },
        caption: {
            fontFamily:
                '"RuneScapeSmall", "RuneScape", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        overline: {
            fontFamily:
                '"RuneScapeSmall", "RuneScape", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: osrsColors.buttonDark,
                    color: osrsColors.bodyMain,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    },
                },
                contained: {
                    backgroundColor: osrsColors.ecstasy,
                    color: osrsColors.buttonDark,
                    '&:hover': {
                        backgroundColor: osrsColors.korma,
                    },
                },
                outlined: {
                    borderColor: osrsColors.bodyBorder,
                    color: osrsColors.buttonDark,
                    '&:hover': {
                        backgroundColor: osrsColors.bodyLight,
                        borderColor: osrsColors.bodyDark,
                    },
                },
            },
            variants: [
                {
                    props: { variant: 'contained', color: 'secondary' },
                    style: {
                        backgroundColor: osrsColors.curiousBlue,
                        color: osrsColors.alabaster,
                        fontWeight: 600,
                        padding: '12px 24px',
                        '&:hover': {
                            backgroundColor: osrsColors.regalBlue,
                        },
                    },
                },
                {
                    props: { variant: 'contained', color: 'warning' },
                    style: {
                        backgroundColor: osrsColors.supernova,
                        color: osrsColors.buttonDark,
                        fontWeight: 600,
                        padding: '12px 24px',
                        '&:hover': {
                            backgroundColor: osrsColors.cinnamon,
                        },
                    },
                },
            ],
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: osrsColors.bodyMain,
                    border: `2px solid ${osrsColors.bodyBorder}`,
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    backgroundColor: osrsColors.tropicalBlue,
                    color: osrsColors.regalBlue,
                    border: `1px solid ${osrsColors.curiousBlue}`,
                },
                icon: {
                    color: osrsColors.curiousBlue,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: osrsColors.bodyMain,
                    '&:hover': {
                        backgroundColor: osrsColors.buttonLight,
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: osrsColors.bodyMain,
                    border: `1px solid ${osrsColors.bodyBorder}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: osrsColors.buttonDark,
                    '&:hover': {
                        backgroundColor: osrsColors.bodyLight,
                    },
                },
            },
        },
    },
})

// Export the colors for use in components
export { osrsColors }
