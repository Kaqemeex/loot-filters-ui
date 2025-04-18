import AbyssalNexusImage from '../images/abyssal_nexus.png'
import AkkhaImage from '../images/akkha.png'
import BabaImage from '../images/baba.png'
import BareGroundImage from '../images/bare_ground.png'
import CatacombsOfKourendImage from '../images/catacombs_of_kourend.png'
import ChambersOfXericImage from '../images/chambers_of_xeric.png'
import CorruptedGauntletImage from '../images/corrupted_gauntlet.png'
import GauntletImage from '../images/gauntlet.png'
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
import VetionImage from '../images/vetion.png'
import WardensImage from '../images/wardens.png'
import WildernessImage from '../images/wilderness.png'
import ZanarisImage from '../images/zanaris.png'
import ZulAndraImage from '../images/zul_andra.png'

export const BackgroundImage = {
    Random: 'Random',
    Default: 'Default',
    AbyssalNexus: 'Abyssal Nexus',
    Akkha: 'Akkha',
    Baba: 'Ba-Ba',
    BareGround: 'Bare ground',
    CatacombsOfKourend: 'Catacombs of Kourend',
    ChambersOfXeric: 'Chambers of Xeric',
    CorruptedGauntlet: 'Corrupted Gauntlet',
    Gauntlet: 'Gauntlet',
    GodWarsDungeon: 'God Wars Dungeon',
    Grass: 'Grass',
    Kephri: 'Kephri',
    Nightmare: 'Nightmare',
    Prifddinas: 'Prifddinas',
    RevenantCaves: 'Revenant Caves',
    Sand: 'Sand',
    Scar: 'Scar',
    Tzhaar: 'Tzhaar',
    Undercity: 'Undercity',
    VerzikVitur: 'Verzik Vitur',
    Vetion: 'Vetion',
    Wardens: 'Wardens',
    Wilderness: 'Wilderness',
    Zanaris: 'Zanaris',
    ZulAndra: 'Zul-andra',
} as const
export type BackgroundImage =
    (typeof BackgroundImage)[keyof typeof BackgroundImage]
export const backgroundImages = Object.values<BackgroundImage>(BackgroundImage)

export const imageFromBackgroundImage = (backgroundImage: BackgroundImage) => {
    switch (backgroundImage) {
        case BackgroundImage.AbyssalNexus:
            return AbyssalNexusImage
        case BackgroundImage.Akkha:
            return AkkhaImage
        case BackgroundImage.Baba:
            return BabaImage
        case BackgroundImage.BareGround:
            return BareGroundImage
        case BackgroundImage.CatacombsOfKourend:
            return CatacombsOfKourendImage
        case BackgroundImage.ChambersOfXeric:
            return ChambersOfXericImage
        case BackgroundImage.CorruptedGauntlet:
            return CorruptedGauntletImage
        case BackgroundImage.Gauntlet:
            return GauntletImage
        case BackgroundImage.GodWarsDungeon:
            return GodWarsDungeonImage
        case BackgroundImage.Grass:
            return GrassImage
        case BackgroundImage.Kephri:
            return KephriImage
        case BackgroundImage.Nightmare:
            return NightmareImage
        case BackgroundImage.Prifddinas:
            return PrifddinasImage
        case BackgroundImage.RevenantCaves:
            return RevenantCavesImage
        case BackgroundImage.Sand:
            return SandImage
        case BackgroundImage.Scar:
            return ScarImage
        case BackgroundImage.Tzhaar:
            return TzhaarImage
        case BackgroundImage.Undercity:
            return UndercityImage
        case BackgroundImage.VerzikVitur:
            return VerzikViturImage
        case BackgroundImage.Vetion:
            return VetionImage
        case BackgroundImage.Wardens:
            return WardensImage
        case BackgroundImage.Wilderness:
            return WildernessImage
        case BackgroundImage.Zanaris:
            return ZanarisImage
        case BackgroundImage.ZulAndra:
            return ZulAndraImage
    }
}
