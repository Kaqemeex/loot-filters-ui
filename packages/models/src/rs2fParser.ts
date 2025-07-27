export type Rs2fValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | { [key: string]: string }
    | null
export type Rs2fDefine = {
    name: string
    value: Rs2fValue
    type:
        | 'style'
        | 'number'
        | 'string'
        | 'stringlist'
        | 'numberlist'
        | 'boolean'
        | 'null'
}

// Function to parse the name field from the meta block
export const parseMetaName = (content: string): string | null => {
    const metaBlockRegex = /meta\s*{([^}]*)}/ // Matches the meta block
    const nameRegex = /name\s*=\s*"([^"]*)"/ // Matches the name field

    const metaBlockMatch = content.match(metaBlockRegex)
    if (metaBlockMatch) {
        const metaBlockContent = metaBlockMatch[1] // Extract the content inside the meta block
        const nameMatch = metaBlockContent.match(nameRegex)
        if (nameMatch) {
            return nameMatch[1] // Return the name value
        }
    }

    return null // Return null if no name is found
}

// Function to parse the description field from the meta block
export const parseMetaDescription = (content: string): string | null => {
    const metaBlockRegex = /meta\s*{([^}]*)}/ // Matches the meta block
    const descriptionRegex = /description\s*=\s*"([^"]*)"/ // Matches the description field

    const metaBlockMatch = content.match(metaBlockRegex)
    if (metaBlockMatch) {
        const metaBlockContent = metaBlockMatch[1] // Extract the content inside the meta block
        const descriptionMatch = metaBlockContent.match(descriptionRegex)
        if (descriptionMatch) {
            return descriptionMatch[1] // Return the description value
        }
    }

    return null // Return null if no description is found
}
