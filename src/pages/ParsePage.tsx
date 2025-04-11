import { Editor } from '@monaco-editor/react'
import { useState } from 'react'
import { parse } from '../parsing/parse'

const content = `
// module:barb_potions

/*@ define:module:barb_potions
---
name: Barbarian Potions
rs2fPath: mod_barb_potions.rs2f
subtitle: People use these?
description: This module provides per-item filtering and custom styling for all barbarian potions. By default ALL barbarian potions are filtered out. LOL
*/

/*@ define:input:barb_potions
---
macroName: VAR_BARB_POTIONS_HIDE
moduleId: barb_potions
label: Potions to hide
type: enumlist
enum:
  - value: Attack mix*
    label: Attack mix
  - value: Antipoison mix*
    label: Antipoison mix
  - value: Relicym's mix*
    label: Relicym's mix
  - value: Strength mix*
    label: Strength mix
  - value: Restore mix*
    label: Restore mix
  - value: Energy mix*
    label: Energy mix
  - value: Defence mix*
    label: Defence mix
  - value: Agility mix*
    label: Agility mix
  - value: Combat mix*
    label: Combat mix
  - value: Prayer mix*
    label: Prayer mix
  - value: Superattack mix*
    label: Superattack mix
  - value: Anti-poison supermix*
    label: Anti-poison supermix
  - value: Fishing mix*
    label: Fishing mix
  - value: Super energy mix*
    label: Super energy mix
  - value: Hunting mix*
    label: Hunting mix
  - value: Super str. mix*
    label: Super str. mix
  - value: Magic essence mix*
    label: Magic essence mix
  - value: Super restore mix*
    label: Super restore mix
  - value: Super def. mix*
    label: Super def. mix
  - value: Antidote+ mix*
    label: Antidote+ mix
  - value: Antifire mix*
    label: Antifire mix
  - value: Ranging mix*
    label: Ranging mix
  - value: Magic mix*
    label: Magic mix
  - value: Zamorak mix*
    label: Zamorak mix
  - value: Stamina mix*
    label: Stamina mix
  - value: Extended antifire mix*
    label: Extended antifire mix
  - value: Ancient mix*
    label: Ancient mix
  - value: Super antifire mix*
    label: Super antifire mix
  - value: Extended super antifire mix*
    label: Extended super antifire mix
*/
#define VAR_BARB_POTIONS_HIDE ["Attack mix*", "Antipoison mix*", "Relicym's mix*", "Strength mix*", "Restore mix*", "Energy mix*", "Defence mix*", "Agility mix*", "Combat mix*", "Prayer mix*", "Superattack mix*", "Anti-poison supermix*", "Fishing mix*", "Super energy mix*", "Hunting mix*", "Super str. mix*", "Magic essence mix*", "Super restore mix*", "Super def. mix*", "Antidote+ mix*", "Antifire mix*", "Ranging mix*", "Magic mix*", "Zamorak mix*", "Stamina mix*", "Extended antifire mix*", "Ancient mix*", "Super antifire mix*", "Extended super antifire mix*"]

/*@ define:input:barb_potions
---
macroName: VAR_BARB_POTIONS_ATTACK_MIX_CUSTOMSTYLE
label: Attack mix custom style
type: style
exampleItem: Attack mix
*/
#define VAR_BARB_POTIONS_ATTACK_MIX_CUSTOMSTYLE textColor="#FFFFFFFF";\\n textAccentColor="#FF000000";\\n backgroundColor="#5074E2E6";\\n borderColor="#FF74E2E6";\\n menuTextColor="#FF74E2E6";
`

export const ParsePage = () => {
    const [editorContent, setEditorContent] = useState(content)

    return (
        <div>
            <Editor
                height="70vh"
                language="cpp"
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false,
                    },
                    readOnly: false,
                }}
                value={editorContent}
                onChange={(value) => {
                    if (value) {
                        setEditorContent(value)
                    }
                }}
            />
            <Editor
                height="70vh"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(parse(editorContent), null, 2)}
                options={{
                    minimap: {
                        enabled: false,
                    },
                    readOnly: true,
                }}
            />
        </div>
    )
}
