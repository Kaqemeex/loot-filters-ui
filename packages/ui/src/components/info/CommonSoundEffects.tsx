import React from 'react'
import { Grid2, Typography } from '@mui/material'

import Sound_413 from '../../sounds/413_quack.wav'
import Sound_2136 from '../../sounds/2136_swamp_fart_2.wav'
import Sound_2310 from '../../sounds/2310_quiz_select.wav'
import Sound_2380 from '../../sounds/2380_bell1.wav'
import Sound_3385 from '../../sounds/3385_FI_bell.wav'
import Sound_4218 from '../../sounds/4218_league_trophy_ding.wav'
import Sound_5316 from '../../sounds/5316_leagues_III_fragment_dropped_traded.wav'
import Sound_6765 from '../../sounds/6765_sotn_muspah_unique_loot_02.wav'
import Sound_10241 from '../../sounds/10241.wav'

export const CommonSoundEffects: React.FC<{}> = () => (
    <Grid2 container size={12}>
        <CommonSoundEffect id={'413'} desc={'Quack'} sound={Sound_413} />
        <CommonSoundEffect id={'1299-1307'} desc={'Light beams'} />
        <CommonSoundEffect id={'2136'} desc={'Dung'} sound={Sound_2136} />
        <CommonSoundEffect
            id={'2310'}
            desc={'Quiz select'}
            sound={Sound_2310}
        />
        <CommonSoundEffect id={'2380'} desc={'Bell'} sound={Sound_2380} />
        <CommonSoundEffect
            id={'3385'}
            desc={'Fossil island bell'}
            sound={Sound_3385}
        />
        <CommonSoundEffect
            id={'4218'}
            desc={'Leagues trophy'}
            sound={Sound_4218}
        />
        <CommonSoundEffect
            id={'5316'}
            desc={'Leagues III fragment'}
            sound={Sound_5316}
        />
        <CommonSoundEffect
            id={'6765'}
            desc={'Muspah drop'}
            sound={Sound_6765}
        />
        <CommonSoundEffect
            id={'10241'}
            desc={'Yama drop'}
            sound={Sound_10241}
        />
    </Grid2>
)

const CommonSoundEffect: React.FC<{
    id: string
    desc: string
    sound?: any
}> = ({ id, desc, sound }) => (
    <Grid2 container size={12}>
        <Grid2 size={3}>
            <Typography>{id}</Typography>
        </Grid2>
        <Grid2 size={5}>
            <Typography color="secondary">{desc}</Typography>
        </Grid2>
        {!!sound && (
            <Grid2 size={4}>
                <audio
                    style={{ width: 150, height: 25 }}
                    controls
                    controlsList="play nodownload noplaybackrate"
                    src={sound}
                />
            </Grid2>
        )}
    </Grid2>
)
