import { useEffect, useState } from 'react'
import getIspoInfos from '../cadence/web/scripts/getISPOInfos.cdc'
import * as fcl from '@onflow/fcl'


export function useIspos() {
    const [ispos, setIspos] = useState([])

    const fetchIspos = async () => {
        let res
        try {
            res = await fcl.query({
                cadence: getIspoInfos,
                args: (arg, t) => []
            })
        } catch(e) {
            // Likely need to mint first to create capability if this fails
            res = []
        } finally {
            setIspos(res)
        }
    }

    useEffect(() => {
        fetchIspos()
    }, [])

    return ispos
}
 