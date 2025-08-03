// import { PrecompiledFilter, render } from '@loot-filters/core'
// import { generateId } from '@loot-filters/core/src/idgen'
// import { Env } from './env'

// const getKeys = (id: string) => {
//     return {
//         prefixRs2fKey: `precompiled/${id}/prefix.rs2f`,
//         filterRs2fKey: `precompiled/${id}/filter.rs2f`,
//         suffixRs2fKey: `precompiled/${id}/suffix.rs2f`,
//         prefixConfigKey: `precompiled/${id}/prefix.json`,
//         filterConfigKey: `precompiled/${id}/filter.json`,
//         suffixConfigKey: `precompiled/${id}/suffix.json`,
//     }
// }

// export const savePrecompiled = async (filter: PrecompiledFilter, env: Env) => {
//     const {
//         prefixRs2fKey,
//         filterRs2fKey,
//         suffixRs2fKey,
//         prefixConfigKey,
//         filterConfigKey,
//         suffixConfigKey,
//     } = getKeys(generateId())

//     if (filter.prefix) {
//         env.FILTERS_BUCKET.put(prefixRs2fKey, filter.prefix?.rs2f)
//         env.FILTERS_BUCKET.put(
//             prefixConfigKey,
//             JSON.stringify(filter.prefix.macroBindings)
//         )
//     }
//     env.FILTERS_BUCKET.put(filterRs2fKey, filter.filter.rs2f)
//     env.FILTERS_BUCKET.put(
//         filterConfigKey,
//         JSON.stringify(filter.filter.macroBindings)
//     )
//     if (filter.suffix) {
//         env.FILTERS_BUCKET.put(suffixRs2fKey, filter.suffix?.rs2f)
//         env.FILTERS_BUCKET.put(
//             suffixConfigKey,
//             JSON.stringify(filter.suffix?.macroBindings)
//         )
//     }
// }

// export const loadPrecompiled = async (id: string, env: Env) => {
//     const {
//         prefixRs2fKey,
//         filterRs2fKey,
//         suffixRs2fKey,
//         prefixConfigKey,
//         filterConfigKey,
//         suffixConfigKey,
//     } = getKeys(id)

//     const [
//         prefixRs2f,
//         prefixConfig,
//         filterRs2f,
//         filterConfig,
//         suffixRs2f,
//         suffixConfig,
//     ] = await Promise.all([
//         env.FILTERS_BUCKET.get(prefixRs2fKey).then((rs2f) => rs2f?.text()),
//         env.FILTERS_BUCKET.get(prefixConfigKey).then((config) =>
//             config?.text()
//         ),
//         env.FILTERS_BUCKET.get(filterRs2fKey).then((rs2f) => rs2f?.text()),
//         env.FILTERS_BUCKET.get(filterConfigKey).then((config) =>
//             config?.text()
//         ),
//         env.FILTERS_BUCKET.get(suffixRs2fKey).then((rs2f) => rs2f?.text()),
//         env.FILTERS_BUCKET.get(suffixConfigKey).then((config) =>
//             config?.text()
//         ),
//     ])

//     if (!filterRs2f) {
//         throw new Error('Filter rs2f not found')
//     }

//     const filter = {
//         rs2f: filterRs2f,
//         macroBindings: filterConfig ? JSON.parse(filterConfig) : {},
//     }

//     const prefix = prefixRs2f
//         ? {
//               rs2f: prefixRs2f,
//               macroBindings: prefixConfig ? JSON.parse(prefixConfig) : {},
//           }
//         : undefined

//     const suffix = suffixRs2f
//         ? {
//               rs2f: suffixRs2f,
//               macroBindings: suffixConfig ? JSON.parse(suffixConfig) : {},
//           }
//         : undefined

//     return render(filter, {}, prefix, {}, suffix, {})
// }
