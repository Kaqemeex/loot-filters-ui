import React from 'react'

/**
 * Renders a "glass pane" behind a component that blocks defaulting/propagation
 * of click and focus events. Used in situations where doing so in handlers on
 * the children themselves may be inconvenient / impossible.
 */
export const EventShield: React.FC<{
    children: React.ReactNode
}> = (props) => (
    <div
        onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
        }}
        onFocus={(e) => {
            e.preventDefault()
            e.stopPropagation()
        }}
    >
        {props.children}
    </div>
)
