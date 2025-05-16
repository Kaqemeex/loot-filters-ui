import { Box, createTheme, ThemeProvider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import '.././styles/helpStyles.css'
import { colors, MuiRsTheme } from '../styles/MuiTheme'
export const HelpPage: React.FC = () => {
    const [headings, setHeadings] = useState<
        { id: string; text: string | null; level: number }[]
    >([])

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll(
                '.help-content h3, .help-content h4, .help-content h5'
            )
        ).map((elem) => ({
            id: elem.id || '',
            text: elem.textContent,
            level: Number(elem.nodeName.charAt(1)),
        }))
        setHeadings(elements)
    }, [])

    return (
        <Box
            sx={{
                display: 'flex',
                position: 'relative',
                backgroundColor: colors.rsLightDarkBrown,
                padding: '20px',
            }}
        >
            <Box sx={{ flex: 1, paddingRight: '75px' }}>
                <HelpContent />
            </Box>
            <Box
                component="nav"
                sx={{
                    width: '300px',
                    marginLeft: 'auto',
                    position: 'sticky',
                    top: '120px',
                    overflowY: 'auto',
                    maxHeight: '80vh',
                    alignSelf: 'flex-start',
                    backgroundColor: colors.rsLightBrown,
                    borderLeft: '1px solid #ccc',
                    paddingLeft: 2,
                    paddingRight: 2,
                }}
            >
                <Typography variant="h4" color={colors.rsOrange}>
                    Table of Contents
                </Typography>
                <TableOfContent headings={headings} />
            </Box>
        </Box>
    )
}

const HelpContent = () => {
    const theme = createTheme({
        components: {
            ...MuiRsTheme.components,
            MuiTypography: {
                styleOverrides: {
                    h3: {
                        color: colors.rsOrange, // gold
                        scrollMarginTop: '70px',
                    },
                    h4: {
                        color: colors.rsYellow, // green-yellow
                        scrollMarginTop: '70px',
                    },
                    h5: {
                        color: '#87CEEB', // sky blue
                        scrollMarginTop: '70px',
                    },
                    body1: {
                        color: colors.rsLightestBrown,
                    },
                },
            },
        },
        palette: MuiRsTheme.palette,
        typography: MuiRsTheme.typography,
    })
    return (
        <ThemeProvider theme={theme}>
            <div>
                <Box sx={{ paddingBottom: 8 }} className="help-content">
                    {/* Section: What is Loot Filters/FilterScape */}
                    <Typography
                        variant="h3"
                        id="what-is-loot-filters"
                        gutterBottom
                    >
                        What is Loot Filters/FilterScape
                    </Typography>
                    <Typography
                        variant="h4"
                        id="the-loot-filters-plugin"
                        gutterBottom
                    >
                        The Loot Filters Plugin
                    </Typography>
                    <Typography>
                        Loot Filters is an extended version of the built-in
                        Ground Items plugin. It replicates the majority of the
                        features in ground items, and adds support for
                        scriptable "loot filters". These scriptable loot filters
                        are the core of the plugin, and can be selected and
                        accessed via the Loot Filters side panel (Not the
                        config, pictured below).
                        <br />
                        <br />
                        There are some default filters pre-installed, and
                        more/custom ones can be added by either importing a
                        filter from the clipboard, or adding the .rs2f filter
                        file to the filters folder, accessible through the
                        folder icon. The two defaults are slightly different
                        from one another, try dropping some items and flipping
                        between them to see which you prefer.
                    </Typography>

                    <Typography
                        variant="h4"
                        id="the-filterscape-website"
                        gutterBottom
                    >
                        The FilterScape Website
                    </Typography>
                    <Typography>
                        FilterScape.xyz is the website used to configure and
                        setup your filters. You can take one of the existing
                        default filters and customize it here, changing what is
                        shown/hidden and how it is displayed. This can be
                        extremely in depth, and once you are done, you can
                        export the filter to your clipboard, then import it into
                        the client, to use your new filter. If you want to give
                        the filter to a friend, get a sharable link and send it
                        to them instead. You can also set up sounds on the site,
                        either using the .wav file type, or by picking in-game
                        sound files.
                    </Typography>

                    {/* Section: Getting Started */}
                    <Typography variant="h3" id="getting-started" gutterBottom>
                        Getting Started
                    </Typography>

                    <Typography variant="h4" id="useful-links" gutterBottom>
                        Useful Links
                    </Typography>
                    <Typography component="div">
                        <ul>
                            <li>
                                <a href="https://filterscape.xyz">
                                    https://filterscape.xyz
                                </a>{' '}
                                - the site for making/configuring loot filters
                                (You're on it!).
                            </li>
                            <li>
                                <a href="https://discord.gg/ESbA28wPnt">
                                    FilterScape Discord
                                </a>{' '}
                                - The plugin/site discord channel. If you have
                                issues, suggestions, or just want to chat, this
                                is the place.{' '}
                            </li>
                            <li>
                                <a href="https://runelite.net/plugin-hub/show/loot-filters">
                                    Runelite plugin page for LootFilters
                                </a>{' '}
                                - The plugin page on runelite.
                            </li>
                            <li>
                                <a href="https://github.com/riktenx/loot-filters/blob/userguide/filter-lang.md">
                                    Filter Language Definition (ADVANCED)
                                </a>{' '}
                                - Not relevant for most users, but if you're
                                interested in editing the filter manually via a
                                text editor, this contains the info for
                                that.{' '}
                            </li>
                        </ul>
                    </Typography>

                    {/* Section: Quickstart Guide */}
                    <Typography variant="h4" id="quickstart-guide" gutterBottom>
                        Quickstart Guide
                    </Typography>
                    <Typography>
                        To get the plugin running, at a basic level, all you
                        have to do is install it and enable it. It should
                        immediately be using the default FilterScape filter, and
                        GroundItems should be disabled. If you had already
                        customized ground items significantly, I would make sure
                        to copy your hide/highlight lists over, and make sure
                        things like the despawn timer and value display are what
                        you want them to be. Don't forget that the items can be
                        toggled on and off via the hotkey, which by default is
                        alt, so if things aren't showing, try hitting that. 2
                        taps will disable the overlay, and one will turn it back
                        on. While holding it, you can also right/left click
                        items to hide/highlight them.
                        <br />
                        <br />
                        There are 2 default filters, Filterscape and Joe's
                        Filter, which you can select by opening the Loot Filters
                        side panel (Not the config panel, this is a distinct
                        panel on the sidebar). These each have slightly
                        different styling and setups. I would suggest that you
                        try each of them with some example drops and decide
                        which you prefer, or refer to the “Picking A Filter”
                        section.
                        <br />
                        <br />
                        While you can use the ownership filter here to hide
                        items that you don't own or are natural ground spawns, I
                        would advise leaving those off and instead using the
                        ownership filter on FilterScape, since that can let
                        specific items through for situations like raids.
                        <br />
                        <br />
                        You may also notice that the value tiers from ground
                        items are missing from the config file. This is because
                        this functionality is handled by the filter itself. If
                        you wish to see or modify these, refer to the section on
                        filter editing via FilterScape
                    </Typography>

                    {/* Section: Customizing Filters */}
                    <Typography
                        variant="h3"
                        id="customizing-filters"
                        gutterBottom
                    >
                        Customizing Filters on FilterScape
                    </Typography>
                    <Typography>
                        <a href="https://filterscape.xyz">
                            https://filterscape.xyz
                        </a>{' '}
                        is the primary way to create and edit the .rs2f files
                        that the plugin uses to decide which items to highlight,
                        show, or hide. Any changes you make to the filters will
                        be saved to the browser's cache instantly, so refreshing
                        or leaving the page won't lose the progress you've made.
                    </Typography>

                    {/* Subsections under Customizing */}
                    <Typography variant="h4" id="picking-a-filter" gutterBottom>
                        Picking A Filter
                    </Typography>
                    <Typography>
                        Both the filterscape filter and Joe's filter have
                        extensive options and customizations for specific
                        places, bosses, and items. I would suggest that you
                        initially see what they look like by trying each of the
                        default filters that ship with the plugin on a few items
                        you drop(Make sure nobody else grabs your gear!)
                    </Typography>

                    <Typography
                        variant="h4"
                        id="configuring-the-filter"
                        gutterBottom
                    >
                        Configuring The Filter
                    </Typography>
                    <Typography>
                        There are a massive amount of options that you can edit
                        on each filter, but you don't need to change every
                        single one. If you have some option or setting you want
                        to change, you can look for it, and enter the “module”.
                        Filters are a collection of modules, with each module
                        essentially being its own thing. If you want to change
                        something specific, look for the module that would be
                        relevant. If you ever mess up a module and want to
                        restore it, you can use the gear on the side to reset a
                        module back to default values. This can also be used to
                        disable specific modules.
                        <br />
                        <br />
                        Example: You want to change the highest value tier to
                        trigger at 15m. You would look for the item values
                        module in FilterScape, or the item tiers module in Joe's
                        filter, and then change the value for the tier.
                    </Typography>

                    <Typography variant="h4" id="priority-order" gutterBottom>
                        Priority And Order Of Operations
                    </Typography>
                    <Typography>
                        Rules and modules are applied sequentially, from top to
                        bottom, so a module or rule earlier in the filter that
                        turns an item blue would be overwritten by a later rule
                        that turns an item red, unless the earlier rule
                        specifically says it won't let any further rules apply
                        to the item. You can use this to set up default styling
                        that applies as a baseline early in the filter, like
                        giving every untradable a loot beam, or setting
                        icons/fonts/item values.
                    </Typography>

                    <Typography
                        variant="h4"
                        id="item-display-sound"
                        gutterBottom
                    >
                        Configuring Item Displays And Sounds
                    </Typography>
                    <Typography>
                        Within a module, you'll see rows that have an example
                        item name and menu text. These can be expanded to edit
                        how this rule will make items look, giving a menu that
                        looks like this Changes you make are instantly
                        displayed, so you can easily see what you think of how
                        the item would look. All colors also have transparency
                        settings, so you can configure a partially transparent
                        background, item name, border, or loot beam.
                    </Typography>

                    <Typography variant="h5" id="sound" gutterBottom>
                        Sound
                    </Typography>
                    <Typography>
                        The plugin is able to play custom sounds for item drops
                        as well, if you pick a sound in the drop sound field.
                        There are two options for sounds to use. You can use
                        existing osrs sounds, by their ID by finding them here:
                        <a href="https://oldschool.runescape.wiki/w/List_of_sound_IDs">
                            (wiki list of sound IDs)
                        </a>
                        . Or you can use any .wav sound file that you place into
                        the ~\.runelite\loot-filters\sounds folder. The easiest
                        way to find this folder would be to click the folder
                        icon on the top right of the filters panel, then
                        navigate to the sounds folder.
                        <br />
                        <br />
                        .WAV is the default windows audio format, but it's not
                        as commonly used as something like mp3. There are plenty
                        of online audio converters to turn an mp3 into a wav
                        file, or you can use something like audacity to edit/cut
                        sound files locally.
                        <br />
                        <br />
                        <b>
                            We ask that you do not share any copywrited audio
                            files in the discord, or ask about how to obtain
                            them.
                        </b>
                        <br />
                        <br />
                        Some interesting sound files:
                        <ul>
                            <li>
                                <strong>6765:</strong> Muspah unique loot
                            </li>
                            <li>
                                <strong>10224:</strong> TOA dung jingle
                            </li>
                            <li>
                                <strong>10241</strong> Yama drop
                            </li>
                            <li>
                                <strong>10224</strong> Yama drop strong
                            </li>
                            <li>
                                <strong>2380:</strong> Bell
                            </li>
                            <li>
                                <strong>2310:</strong> Quiz select sound
                            </li>
                            <li>
                                <strong>5316:</strong> Leagues 3 fragment drop
                            </li>
                            <li>
                                <strong>4218:</strong> League trophy ding
                            </li>
                            <li>
                                <strong>413:</strong> Quack
                            </li>
                            <li>
                                <strong>3385:</strong> Fossil island bell
                            </li>
                            <li>
                                <strong>1299-1307:</strong> Light beam sounds
                            </li>
                            <li>
                                <strong>5306:</strong> ACB Spec
                            </li>
                        </ul>
                    </Typography>

                    <Typography variant="h3" id="finishing-up" gutterBottom>
                        Finishing Up
                    </Typography>
                    <Typography
                        variant="h4"
                        id="downloading-installing"
                        gutterBottom
                    >
                        Downloading And Installing The Filter
                    </Typography>
                    <Typography>
                        When you are done, click the export to runelite button
                        at the top of the page. This will open up a popup
                        showing how to add the filter into runelite, by going to
                        the filters panel and clicking the import from clipboard
                        button. Make sure to go and select your new filter
                        manually if it didn't switch to it, although it should
                        do this by default. If it isn't in the list, you could
                        try refreshing the filters with the refresh button in
                        the top right, but that shouldn't be needed. Now your
                        new filter should be active and functioning.
                    </Typography>

                    <Typography variant="h4" id="sharing" gutterBottom>
                        Sharing Filters With Friends
                    </Typography>
                    <Typography>
                        If you want to give a filter to a friend, while you can
                        send them the file directly, we reccomend that you share
                        the filter via the share link besides the export to
                        runelite button. This will ensure that they have the
                        full modified filter saved to their browser so if they
                        want to make any changes in the future, they can just
                        edit it on there themselves. Otherwise they will need to
                        recreate the filter from scratch or get you to share the
                        filter later if they want to edit it.
                    </Typography>
                </Box>
            </div>
        </ThemeProvider>
    )
}

const TableOfContent: React.FC<{
    headings: { id: string; text: string | null; level: number }[]
}> = ({ headings }) => {
    return (
        <Typography color={colors.rsYellow}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {headings.map((heading, idx) => (
                    <li
                        key={idx}
                        style={{ marginLeft: (heading.level - 2) * 12 }}
                    >
                        <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                ))}
            </ul>
        </Typography>
    )
}
