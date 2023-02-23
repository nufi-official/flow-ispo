import { useEffect, useState } from 'react'
import getCurrentEpoch from '../cadence/web/scripts/getCurrentEpoch.cdc'
import * as fcl from '@onflow/fcl'


export function useCurrentEpoch() {
    const [epoch, setEpoch] = useState([])

    const fetchCurrentEpoch = async () => {
        let res
        try {
            res = await fcl.query({
                cadence: getCurrentEpoch,
                args: (arg, t) => []
            })
        } catch(e) {
            // Likely need to mint first to create capability if this fails
            res = []
        } finally {
            setEpoch(res)
        }
    }

    useEffect(() => {
        fetchCurrentEpoch()
    }, [])

    return epoch
}

export function useEpochToDate() {
    const [epochSchedule, setEpochSchedule] = useState(null)
    const defaultApiUrl = 'https://query.testnet.flowgraph.co/?token=06c16d570831aa35211075aba17cf165f7d53dfa'

    const fetchEpochSchedule = async () => {
        let res
        try {
            res = await fetch(process.env.NEXT_PUBLIC_FLOWGRAPH_API_URL || defaultApiUrl, {
                "headers": {
                    "content-type": "application/json",
                },
                "body": "{\"operationName\":\"HistorySectionQuery\",\"variables\":{},\"query\":\"query HistorySectionQuery {\\n  ...HistorySectionFragment\\n}\\n\\nfragment HistorySectionFragment on Query {\\n  stakeEpochs {\\n    ...EpochsTableFragment\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment EpochsTableFragment on StakeEpoch {\\n  index\\n  start\\n  totalStaked\\n  totalRewarded\\n  __typename\\n}\\n\"}",
                "method": "POST",
            });
        } catch(e) {
            // Likely need to mint first to create capability if this fails
            setEpochSchedule(null)
        } finally {
            setEpochSchedule(await res.json())
        }
    }

    useEffect(() => {
        fetchEpochSchedule()
    }, [])

    return (epoch) => {
        if (!epochSchedule) {
            return null
        }
        const startTs = epochSchedule.data.stakeEpochs.find((item) => item.index === epoch)?.start

        return startTs ? new Date(startTs) : null
    }
}