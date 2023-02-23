import {useEffect, useState} from 'react'
import getIspoInfos from '../cadence/web/scripts/getISPOInfos.cdc'
import getAccountISPOs from '../cadence/web/scripts/getAccountISPOs.cdc'
import * as fcl from '@onflow/fcl'

const fetchIspos = async () => {
  let res
  try {
    res = (
      await fcl.query({
        cadence: getIspoInfos,
        args: (arg, t) => [],
      })
    ).map((ispo) => ({
      ...ispo,
      createdAt: new Date(Number(ispo.createdAt) * 1000),
    }))
  } catch (e) {
    // Likely need to mint first to create capability if this fails
    res = []
  } finally {
    return res
  }
}

export function useIspos() {
  const [ispos, setIspos] = useState([])

  const fetch = async () => {
    setIspos(await fetchIspos())
  }

  useEffect(() => {
    fetch()
  }, [])

  return ispos
}

const mockIspo = {
  ispo: {
    id: '44',
    name: 'Mock ISPO',
    rewardTokenBalance: '47000.00000000',
    rewardTokenMetadata: {
      rewardTokenVaultStoragePath: {
        domain: 'storage',
        identifier: 'ispoExampleRewardTokenVault',
      },
      rewardTokenReceiverPublicPath: {
        domain: 'public',
        identifier: 'ispoExampleRewardTokenReceiver',
      },
      rewardTokenBalancePublicPath: {
        domain: 'public',
        identifier: 'ispoExampleRewardTokenBalance',
      },
      totalRewardTokenAmount: '47000.00000000',
    },
    epochStart: '0',
    epochEnd: '12',
    delegationsCount: '0',
    delegatedFlowBalance: '0.00000000',
    flowRewardsBalance: '0.00000000',
    createdAt: '2023-02-23T13:24:42.000Z',
  },
  delegatedFlowBalance: '123456.0',
  rewardTokenBalance: '4747',
}

export function useAccountIspos(address) {
  const [ispos, setIspos] = useState(null)

  const fetchAccountIspos = async () => {
    let res
    try {
      res = address
        ? await fcl.query({
            cadence: getAccountISPOs,
            args: (arg, t) => [arg(address, t.Address)],
          })
        : []
    } catch (e) {
      // Likely need to mint first to create capability if this fails
      res = []
    } finally {
      res = !res?.length ? [mockIspo] : []
      setIspos(res)
    }
  }

  useEffect(() => {
    fetchAccountIspos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return ispos
}
