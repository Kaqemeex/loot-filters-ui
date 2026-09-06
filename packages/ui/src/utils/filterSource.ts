const COMMIT = /^[a-f0-9]{40}$/i

export const resolveFilterSource = async (
    source: string,
    commit?: string
): Promise<{ revisionUrl: string; commit?: string }> => {
    const url = new URL(source)
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Filter source must be an HTTP or HTTPS URL')
    }
    if (commit && !COMMIT.test(commit)) {
        throw new Error('Enter a full 40-character commit SHA')
    }
    if (url.hostname !== 'raw.githubusercontent.com') {
        if (commit)
            throw new Error('Commit selection requires a raw GitHub URL')
        return { revisionUrl: source }
    }

    const [owner, repo, ...parts] = url.pathname.slice(1).split('/')
    let refPrefix = ''
    if (parts[0] === 'refs' && ['heads', 'tags'].includes(parts[1])) {
        refPrefix = parts.slice(0, 2).join('/') + '/'
        parts.splice(0, 2)
    }
    if (!owner || !repo || parts.length < 2) {
        throw new Error(
            'Expected a raw GitHub URL containing a ref and file path'
        )
    }
    if (COMMIT.test(parts[0])) {
        const sha = commit ?? parts[0]
        return {
            revisionUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${parts.slice(1).join('/')}`,
            commit: sha,
        }
    }
    // Resolve the longest matching ref to support branches containing slashes.
    for (let split = parts.length - 1; split >= 1; split--) {
        const ref = decodeURIComponent(parts.slice(0, split).join('/'))
        let sha = ref
        if (!COMMIT.test(ref)) {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(refPrefix + ref)}`
            )
            if (response.status === 404 || response.status === 422) continue
            if (!response.ok) {
                throw new Error(
                    `Could not resolve GitHub revision (${response.status}). Please retry later or use a commit-pinned raw URL.`
                )
            }
            sha = (await response.json()).sha
            if (!COMMIT.test(sha))
                throw new Error('GitHub returned an invalid commit')
        }
        return {
            revisionUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${commit ?? sha}/${parts.slice(split).join('/')}`,
            commit: commit ?? sha,
        }
    }
    throw new Error('Could not resolve the GitHub branch or tag')
}
