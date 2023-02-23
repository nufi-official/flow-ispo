import { useEffect, useState } from 'react'
import getIspoInfos from '../cadence/web/scripts/getISPOInfos.cdc'
import getAccountISPOs from '../cadence/web/scripts/getAccountISPOs.cdc'
import * as fcl from '@onflow/fcl'


export function useIspos() {
    const [ispos, setIspos] = useState([])

    const fetchIspos = async () => {
        let res
        try {
            res = (await fcl.query({
                cadence: getIspoInfos,
                args: (arg, t) => []
            })).map((ispo) => (
                {...ispo, createdAt: new Date(Number(ispo.createdAt) * 1000)}
            ))
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

export function useAccountIspos(address) {
    const [ispos, setIspos] = useState(null)

    const fetchAccountIspos = async () => {
        let res
        try {
            res = address ? await fcl.query({
                cadence: getAccountISPOs,
                args: (arg, t) => [
                    arg(address, t.Address)
                ]
            }) : null
        } catch(e) {
            // Likely need to mint first to create capability if this fails
            res = null
        } finally {
            setIspos(res)
        }
    }

    useEffect(() => {
        fetchAccountIspos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address])

    return ispos
}
 