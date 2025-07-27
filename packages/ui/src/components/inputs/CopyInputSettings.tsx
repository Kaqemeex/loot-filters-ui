import { ContentPasteOff, CopyAll } from '@mui/icons-material'

import { ContentPaste } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useCallback } from 'react'
import { Input, ListOption } from '@loot-filters/models'
import { useAlertStore } from '../../store/alerts'
import { useSettingsCopyStore } from '../../store/settingsCopyStore'
import { colors } from '../../styles/MuiTheme'
import { convertToListDiff } from '../../utils/ListDiffUtils'
import { SmartTooltip } from '../SmartTooltip'

export const CopyInputSettings: React.FC<{
    input: Input
    configToCopy: any
    onChange: (updatedConfig: any) => void
}> = ({ input, configToCopy, onChange }) => {
    const { addAlert } = useAlertStore()
    const { copiedInput, pasteableConfig, setSettingsCopy } =
        useSettingsCopyStore()

    const canPaste =
        copiedInput?.type === input.type && pasteableConfig !== null

    const doCopy = useCallback(() => {
        console.log('doCopy', configToCopy)
        setSettingsCopy(input, configToCopy)
        const formattedConfig = JSON.stringify(configToCopy)
        navigator.clipboard
            .writeText(formattedConfig)
            .then(() => {
                addAlert({
                    children: `${input.label} ${input.type} settings copied to clipboard`,
                    severity: 'success',
                })
            })
            .catch(() => {
                addAlert({
                    children: `Failed to copy ${input.label} ${input.type} settings to clipboard`,
                    severity: 'error',
                })
            })
    }, [configToCopy, onChange])

    return (
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SmartTooltip
                enabledTitle="Copy Settings and Defaults"
                disabledTitle=""
                enabled={true}
            >
                <IconButton
                    component="div"
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        doCopy()
                    }}
                >
                    <CopyAll sx={{ color: colors.rsOrange }} />
                </IconButton>
            </SmartTooltip>
            <SmartTooltip
                enabledTitle="Paste Settings"
                disabledTitle="No settings copied"
                enabled={canPaste}
            >
                <IconButton
                    component="div"
                    disabled={!canPaste}
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()

                        if (input.type.endsWith('list')) {
                            const currentOpts = configToCopy.map(
                                (v: string | ListOption) => {
                                    if (typeof v === 'string') {
                                        return v
                                    }
                                    return v.value
                                }
                            )
                            const pastedOpts = pasteableConfig.map(
                                (v: string | ListOption) => {
                                    if (typeof v === 'string') {
                                        return v
                                    }
                                    return v.value
                                }
                            )
                            const diff = convertToListDiff(
                                pastedOpts,
                                currentOpts
                            )
                            if (input.type === 'stringlist') {
                                onChange(diff)
                            } else if (input.type === 'enumlist') {
                                onChange({
                                    ...diff,
                                    added: diff.added.filter((v) =>
                                        input.enum.includes(v)
                                    ),
                                    removed: diff.removed.filter((v) =>
                                        input.enum.includes(v)
                                    ),
                                })
                            }
                        } else if (input.type === 'style') {
                            onChange(pasteableConfig)
                        }
                        setSettingsCopy(null, null)
                    }}
                >
                    {canPaste && (
                        <ContentPaste
                            sx={{
                                color: colors.rsOrange,
                            }}
                        />
                    )}
                    {!canPaste && (
                        <ContentPasteOff
                            sx={{
                                color: 'grey',
                            }}
                        />
                    )}
                </IconButton>
            </SmartTooltip>
        </div>
    )
}
