import {useEffect, useState} from 'react'
import getIspoInfos from '../cadence/web/scripts/getISPOInfos.cdc'
import getAccountISPOs from '../cadence/web/scripts/getAccountISPOs.cdc'
import getIspoAdminInfos from '../cadence/web/scripts/getIspoAdminInfos.cdc'
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
    })).filter((ispo) => ispo.name !== 'xxx')
  } catch (e) {
    // Likely need to mint first to create capability if this fails
    res = []
  } finally {
    return res
  }
}

export function useIspos() {
  const [ispos, setIspos] = useState(undefined)

  const fetch = async () => {
    setIspos(await fetchIspos())
  }

  useEffect(() => {
    fetch()
  }, [])

  return ispos
}

const mockIspo = {
  id: '133359407',
  ispo: {
    id: '133359190',
    name: 'Test ISPO',
    rewardTokenBalance: '10000.00000000',
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
      totalRewardTokenAmount: '10000.00000000',
    },
    epochStart: '477',
    epochEnd: '2000',
    delegationsCount: '1',
    delegatedFlowBalance: '0.00000000',
    flowRewardsBalance: '0.00000000',
    createdAt: '2023-02-23T22:25:24.000Z',
  },
  ispoId: '133359190',
  delegatedFlowBalance: '0.00000000',
  rewardTokenBalance: '10000.00000000',
  createdAt: '2023-02-23T22:29:04.000Z',
}

export function useAccountIspos(address) {
  const [ispos, setIspos] = useState(undefined)

  const fetchAccountIspos = async () => {
    let res
    try {
      const allIspos = await fetchIspos()
      const rawIspos = address
        ? await fcl.query({
            cadence: getAccountISPOs,
            args: (arg, t) => [arg(address, t.Address)],
          })
        : {}
      res = Object.entries(rawIspos).map(([key, value]) => ({
        id: key,
        ispo: allIspos.find((ispo) => ispo.id === value.ispoId),
        ...value.info,
        hasDelegation: JSON.parse(value.hasDelegation),
        createdAt: new Date(Number(value.info.createdAt) * 1000),
      }))
    } catch (e) {
      // Likely need to mint first to create capability if this fails
      res = []
    } finally {
      const network = await fcl.config.get('flow.network')
      res = !res.length && network === 'local' ? [mockIspo] : res
      setIspos(res)
    }
  }

  useEffect(() => {
    if (address) {
      fetchAccountIspos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return ispos
}

export function useAccountAdminIspos(address) {
  const [ispos, setIspos] = useState(null)

  const fetchAccountAdminIspos = async () => {
    let res
    try {
      res = await fcl.query({
        cadence: getIspoAdminInfos,
        args: (arg, t) => [arg(address, t.Address)],
      })
    } catch (e) {
      // Likely need to mint first to create capability if this fails
      res = []
    } finally {
      setIspos(res)
    }
  }

  useEffect(() => {
    if (address) {
      fetchAccountAdminIspos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return ispos
}
