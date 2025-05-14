import { parse as parseYaml } from 'yaml'
import { InputSpec as FilterSpecInput } from './FilterTypesSpec'
import { Icon } from './IconSpec'
import {
    BooleanInputSpec,
    EnumListInputSpec,
    Input,
    InputSpec,
    NumberInputSpec,
    StringListInputSpec,
    StyleConfig,
    StyleInputSpec,
    TextInputSpec,
} from './UiTypesSpec'
import { TokenType } from './token'
import { TokenStream, TokenStreamError } from './tokenstream'

export const parseInput = (comment: string, define: TokenStream): Input => {
    const declarationContent = comment.substring(
        comment.indexOf('\n'), // chop the structured declaration
        comment.indexOf('*/')
    )

    define.takeExpect(TokenType.PREPROC_DEFINE)
    const macroName = define.takeExpect(TokenType.IDENTIFIER).value

    const declaration = parseYaml(declarationContent)
    if (declaration.default !== undefined) {
        throw new Error('input declaration must not have a default')
    }
    const baseInput = {
        // This throws if the core input fields are incorrect
        ...FilterSpecInput.parse(declaration),
        macroName,
    }
    const input = InputSpec.parse(baseInput)

    // validate the input with a default field; to check that the default field is correct
    switch (input.type as unknown as string) {
        case 'boolean':
            input.default = define.takeBool()
            return BooleanInputSpec.parse(input)
        case 'number':
            input.default = define.takeInt()
            return NumberInputSpec.parse(input)
        case 'stringlist':
            input.default = define.takeStringList()
            return StringListInputSpec.parse(input)
        case 'enumlist':
            input.default = define.takeStringList()
            return EnumListInputSpec.parse(input)
        case 'style':
            input.default = parseStyle(define)
            return StyleInputSpec.parse(input)
        case 'text':
            input.default = define.takeString()
            return TextInputSpec.parse(input)
        default:
            throw new Error(`Invalid input type: ${input.type}`)
    }
}

const parseStyle = (tokens: TokenStream): StyleConfig => {
    const style: StyleConfig = {}
    while (tokens.hasTokens()) {
        const ident = tokens.takeExpect(TokenType.IDENTIFIER)
        tokens.takeExpect(TokenType.ASSIGN)

        switch (ident.value) {
            case 'color':
            case 'textColor': // zod validates that these are color strings
                style.textColor = tokens.takeString()
                break
            case 'backgroundColor':
                style.backgroundColor = tokens.takeString()
                break
            case 'borderColor':
                style.borderColor = tokens.takeString()
                break
            case 'hidden':
                style.hidden = tokens.takeBool()
                break
            case 'showLootbeam':
            case 'showLootBeam':
                style.showLootbeam = tokens.takeBool()
                break
            case 'showValue':
                style.showValue = tokens.takeBool()
                break
            case 'showDespawn':
                style.showDespawn = tokens.takeBool()
                break
            case 'notify':
                style.notify = tokens.takeBool()
                break
            case 'textAccent':
                style.textAccent = tokens.takeInt()
                break
            case 'textAccentColor':
                style.textAccentColor = tokens.takeString()
                break
            case 'lootbeamColor':
            case 'lootBeamColor':
                style.lootbeamColor = tokens.takeString()
                break
            case 'fontType':
                style.fontType = tokens.takeInt()
                break
            case 'menuTextColor':
                style.menuTextColor = tokens.takeString()
                break
            case 'highlightTile':
                style.highlightTile = tokens.takeBool()
                break
            case 'tileStrokeColor':
                style.tileStrokeColor = tokens.takeString()
                break
            case 'tileFillColor':
                style.tileFillColor = tokens.takeString()
                break
            case 'hideOverlay':
                // we recognize this but the site doesn't support it
                tokens.takeBool()
                break
            case 'sound':
                const value = tokens.peek()
                if (value.type === TokenType.LITERAL_INT) {
                    style.sound = tokens.takeInt()
                } else if (value.type === TokenType.LITERAL_STRING) {
                    style.sound = tokens.takeString()
                } else {
                    throw new TokenStreamError('invalid sound value', value)
                }
                break
            case 'menuSort':
                style.menuSort = tokens.takeInt()
                break
            case 'icon':
                style.icon = parseStyleIcon(tokens)
                break
            default:
                throw new TokenStreamError('invalid style property', ident)
        }

        tokens.takeExpect(TokenType.STMT_END)
    }

    return style
}

const parseStyleIcon = (tokens: TokenStream): Icon => {
    const exprName = tokens.takeExpect(TokenType.IDENTIFIER)
    tokens.takeExpect(TokenType.EXPR_START)

    switch (exprName.value) {
        case 'Sprite':
            const spriteId = tokens.takeInt()
            tokens.takeExpect(TokenType.COMMA)
            const spriteIndex = tokens.takeInt()
            tokens.takeExpect(TokenType.EXPR_END)
            return { type: 'sprite', spriteId, spriteIndex }
        case 'Item':
            const itemId = tokens.takeInt()
            tokens.takeExpect(TokenType.EXPR_END)
            return { type: 'itemId', itemId }
        case 'File':
            const filePath = tokens.takeString()
            tokens.takeExpect(TokenType.EXPR_END)
            return { type: 'file', filePath }
        case 'CurrentItem':
            tokens.takeExpect(TokenType.EXPR_END)
            return { type: 'current' }
        default:
            throw new TokenStreamError('unexpected icon expression', exprName)
    }
}
