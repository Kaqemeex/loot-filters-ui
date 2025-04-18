import { Box, SxProps } from '@mui/material'
import AbyssalNexusImage from '../images/abyssal_nexus.png'
import AkkhaImage from '../images/akkha.png'
import BabaImage from '../images/baba.png'
import BareGroundImage from '../images/bare_ground.png'
import CatacombsOfKourendImage from '../images/catacombs_of_kourend.png'
import ChambersOfXericImage from '../images/chambers_of_xeric.png'
import GodWarsDungeonImage from '../images/god_wars_dungeon.png'
import GrassImage from '../images/grass.png'
import KephriImage from '../images/kephri.png'
import NightmareImage from '../images/nightmare.png'
import PrifddinasImage from '../images/prifddinas.png'
import RevenantCavesImage from '../images/revenant_caves.png'
import SandImage from '../images/sand.png'
import ScarImage from '../images/scar.png'
import TzhaarImage from '../images/tzhaar.png'
import UndercityImage from '../images/undercity.png'
import VerzikViturImage from '../images/verzik_vitur.png'
import WardensImage from '../images/wardens.png'
import WildernessImage from '../images/wilderness.png'
import ZanarisImage from '../images/zanaris.png'
import ZulAndraImage from '../images/zul_andra.png'

import { useEffect, useState } from 'react'
import { StyleConfig, StyleInput } from '../parsing/UiTypesSpec'
import { useBackgroundStore } from '../store/background'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useFilterStore } from '../store/filterStore'
import { colors } from '../styles/MuiTheme'
import { BackgroundImage, imageFromBackgroundImage } from '../types/Images'
import { fontFamilyFromFontType, FontType } from '../types/Rs2fEnum'
import { colorHexToRgbaCss } from '../utils/Color'

export const ItemMenuPreview: React.FC<{
    itemName: string
    input: StyleInput
}> = ({ itemName, input }) => {
    const activeFilterId = useFilterStore(
        (state) =>
            Object.keys(state.filters).find((id) => state.filters[id].active)!!
    )

    const activeConfig = useFilterConfigStore(
        (state) =>
            state.filterConfigurations?.[activeFilterId!!]?.inputConfigs?.[
                input.macroName
            ] as Partial<StyleConfig>
    )

    const menuTextColor = colorHexToRgbaCss(
        activeConfig?.menuTextColor ?? input.default?.menuTextColor
    )

    return (
        <Box>
            <div
                style={{
                    display: 'flex',
                    backgroundColor: colors.rsLightBrown,
                    border: `1px solid ${colors.rsLightBrown}`,
                }}
            >
                <div
                    style={{
                        borderRadius: '2px',
                    }}
                >
                    <div
                        style={{
                            color: colors.rsLightBrown,
                            fontFamily: 'RuneScape',
                            fontSize: '24px',
                            border: `1px solid ${colors.rsLightBrown}`,
                            borderRadius: '2px',
                            backgroundColor: colors.rsBlack,
                        }}
                    >
                        Choose Option
                    </div>
                    <div
                        style={{
                            border: `2px solid ${colors.rsBlack}`,
                            backgroundColor: colors.rsLightBrown,
                        }}
                    >
                        <div style={{ margin: '2px' }}>
                            <span
                                style={{
                                    color: colors.rsWhite,
                                    fontFamily: 'RuneScapeSmall',
                                    fontSize: '24px',
                                }}
                            >
                                Take{' '}
                            </span>
                            <span
                                style={{
                                    color: menuTextColor,
                                    fontFamily: 'RuneScapeSmall',
                                    fontSize: '24px',
                                }}
                            >
                                {input.exampleItem || itemName || 'Item Name'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    )
}

const backgroundImages = [
    AbyssalNexusImage,
    AkkhaImage,
    BabaImage,
    BareGroundImage,
    CatacombsOfKourendImage,
    ChambersOfXericImage,
    GodWarsDungeonImage,
    GrassImage,
    KephriImage,
    NightmareImage,
    PrifddinasImage,
    RevenantCavesImage,
    SandImage,
    ScarImage,
    TzhaarImage,
    UndercityImage,
    VerzikViturImage,
    WardensImage,
    WildernessImage,
    ZanarisImage,
    ZulAndraImage,
]
export const ItemLabelPreview: React.FC<{
    itemName: string
    input: StyleInput
    sx?: SxProps
}> = ({ itemName, input, sx }) => {
    const activeFilterId = useFilterStore(
        (state) =>
            Object.keys(state.filters).find((id) => state.filters[id].active)!!
    )

    const activeConfig = useFilterConfigStore(
        (state) =>
            state.filterConfigurations?.[activeFilterId!!]?.inputConfigs?.[
                input.macroName
            ] as Partial<StyleConfig>
    )

    const backgroundColor = colorHexToRgbaCss(
        activeConfig?.backgroundColor ?? input.default?.backgroundColor
    )
    const borderColor = colorHexToRgbaCss(
        activeConfig?.borderColor ?? input.default?.borderColor
    )
    const foregroundColor = colorHexToRgbaCss(
        activeConfig?.textColor ?? input.default?.textColor
    )

    const hidden =
        activeConfig?.hideOverlay ?? input.default?.hideOverlay ?? false

    const fontType = (activeConfig?.fontType ?? input.default?.fontType) as
        | FontType
        | undefined
    const fontFamily = fontFamilyFromFontType(fontType)

    const textAccent = activeConfig?.textAccent ?? input.default?.textAccent

    const textAccentColor =
        activeConfig?.textAccentColor ?? input.default?.textAccentColor

    let textAccentStyle: React.CSSProperties & {
        webkitTextStroke?: string
    } = {}
    switch (textAccent) {
        // Outline
        case 2:
            textAccentStyle = {
                WebkitTextStroke: `1px ${colorHexToRgbaCss(textAccentColor) ?? 'rgb(0,0,0,0)'}`,
            }
            break
        // None
        case 3:
            textAccentStyle = {}
            break
        // Shadow Bold
        case 4:
            textAccentStyle = {
                textShadow: '2px 2px #000000',
            }
            break
        // Shadow is default
        case 1:
        default:
            textAccentStyle = {
                textShadow: '1px 1px #000000',
            }
            break
    }

    const [randomBackgroundImageIndex, setBackgroundImageIndex] = useState(
        Math.floor(Math.random() * backgroundImages.length)
    )

    const activeBackground = useBackgroundStore((state) => state.background)

    useEffect(() => {
        if (activeBackground === BackgroundImage.Random) {
            const interval = window.setInterval(
                () => {
                    setBackgroundImageIndex(
                        Math.floor(Math.random() * backgroundImages.length)
                    )
                },
                Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000
            )

            return () => {
                clearInterval(interval)
            }
        }
    }, [activeBackground])

    const activeBackgroundImage = (() => {
        if (activeBackground === BackgroundImage.Default) {
            // Default means: use the background image from the input and godwarsdungeon if not set
            return input.backgroundImage
                ? imageFromBackgroundImage(
                      input.backgroundImage as BackgroundImage
                  )
                : imageFromBackgroundImage(BackgroundImage.GodWarsDungeon)
        }
        return activeBackground === BackgroundImage.Random
            ? backgroundImages[randomBackgroundImageIndex]
            : imageFromBackgroundImage(activeBackground)
    })()

    return (
        <div
            style={{
                border: '3px solid #2c2721',
                backgroundRepeat: 'repeat',
                backgroundPosition: 'center',
                backgroundImage: `url(${activeBackgroundImage})`,
            }}
        >
            {hidden && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#ffffff',
                        fontFamily: 'RuneScapeSmall',
                        fontSize: '20px',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                >
                    Hidden
                </div>
            )}
            <div
                style={{
                    margin: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: backgroundColor,
                    border: `1px solid ${borderColor}`,
                    ...textAccentStyle,
                }}
            >
                <span
                    style={{
                        padding: '4px',
                        color: foregroundColor ?? '#ffffff',
                        fontSize: '24px',
                        fontFamily: fontFamily,
                    }}
                >
                    {input.exampleItem || itemName || 'Item Name'}
                </span>
            </div>
        </div>
    )
}
