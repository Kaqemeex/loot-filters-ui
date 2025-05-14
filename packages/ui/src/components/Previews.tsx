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
import { getIcon, getSprite } from '../images/osrs/imageUtils'
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

    const [icon, setIcon] = useState<HTMLImageElement | undefined>(undefined)

    let iconConfig = activeConfig?.icon ?? input.default?.icon
    useEffect(() => {
        switch (iconConfig?.type) {
            case 'itemId':
                getIcon(iconConfig.itemId, setIcon)
                break
            case 'sprite':
                getSprite(
                    iconConfig.spriteId ?? 0,
                    iconConfig.spriteIndex ?? 0,
                    setIcon
                )
                break
            case 'current':
                if (input.exampleItemId) {
                    getIcon(input.exampleItemId, setIcon)
                }
                break
            default:
                break
        }
    }, [setIcon, iconConfig, input.exampleItemId])

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

    let activeBackgroundImage = null
    if (activeBackground === BackgroundImage.Default) {
        activeBackgroundImage = imageFromBackgroundImage(
            (input.backgroundImage as BackgroundImage) ??
                BackgroundImage.GodWarsDungeon
        )
    } else if (activeBackground === BackgroundImage.Random) {
        activeBackgroundImage = backgroundImages[randomBackgroundImageIndex]
    } else {
        activeBackgroundImage = imageFromBackgroundImage(activeBackground)
    }

    const isHidden = activeConfig?.hidden ?? input.default?.hidden

    return (
        <div
            style={{
                border: '3px solid #2c2721',
                backgroundRepeat: 'repeat',
                backgroundPosition: 'center',
                backgroundImage: `url(${activeBackgroundImage})`,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {icon && (
                <img
                    style={{
                        verticalAlign: 'middle',
                        marginLeft: '4px',
                    }}
                    src={icon.src}
                    alt={icon.name}
                />
            )}
            <div
                style={{
                    margin: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: isHidden ? undefined : backgroundColor,
                    // background:
                    //     'linear-gradient(45deg,rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)',
                    border: isHidden ? undefined : `1px solid ${borderColor}`,
                    ...textAccentStyle,
                }}
            >
                <span>
                    <span
                        style={{
                            padding: '2px',
                            color: isHidden
                                ? '#808080'
                                : (foregroundColor ?? '#ffffff'),
                            fontSize: '24px',
                            fontFamily: fontFamily,

                            verticalAlign: 'middle',
                            lineHeight: '1.0',
                        }}
                    >
                        {input.exampleItem || itemName || 'Item Name'}
                    </span>
                </span>
            </div>
        </div>
    )
}
