import * as fcl from '@onflow/fcl'
import useCurrentUser from '../../hooks/useCurrentUser'
import getIspoInfos from '../../cadence/webScripts/getISPOInfos.cdc'
import { useEffect, useState } from "react"

export default function ParticipateIspoPage() {
  const { addr } = useCurrentUser()

  const [ispos, setIspos] = useState([])

  const fetchIspos = async () => {
    let res
    try {
      res = await fcl.query({
        cadence: getIspoInfos,
        args: (arg, t) => []
      })
      console.log('res', res)
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

  return (
    <>
      <div>JOIN {addr}</div>
      <div>{JSON.stringify(ispos)}</div>
    </>
  )
}