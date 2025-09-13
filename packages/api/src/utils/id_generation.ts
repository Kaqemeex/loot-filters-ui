export const generateId = (prefix: string): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = `${prefix}-`
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}
