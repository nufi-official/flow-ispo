import Link from 'next/link'
import {useState} from 'react'
import {
  Box,
  Button,
  Tooltip,
  Typography,
  CircularProgress,
  Backdrop,
  Portal,
  Alert,
} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import {useAccountIspos} from '../../hooks/ispo'
import useCurrentUser from '../../hooks/useCurrentUser'
import {formatCompactAmount} from '../../helpers/utils'
import CardGrid from '../../layouts/CardGrid'
import withdrawFlowFromIspo from '../../cadence/web/transactions/client/withdrawNodeDelegator.cdc'
import withdrawRewardTokens from '../../cadence/web/transactions/client/withdrawRewardTokens.cdc'
import * as fcl from '@onflow/fcl'
import { useCurrentEpoch } from '../../hooks/epochs'

export default function MyParticipations() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountIspos(addr)

  return (
    <CardGrid>
      {!accountIspos && !!addr && <CircularProgress />}
      {accountIspos?.map((data) => (
        <MyParticipationCard {...data} key={data.id} />
      ))}
      {!addr && (
        <Box>
          <Typography variant="h5" sx={{fontWeight: 'bold'}}>
            You are not logged in
          </Typography>
        </Box>
      )}
      {addr && accountIspos?.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" sx={{fontWeight: 'bold'}}>
            You are not participating in any ISPO right now.
          </Typography>
          <Button variant="gradient" component={Link} href="/participate">
            Check the offerings{' '}
          </Button>
        </Box>
      )}
    </CardGrid>
  )
}

function MyParticipationCard({
  id: ispoClientId,
  ispo,
  delegatedFlowBalance,
  rewardTokenBalance,
  createdAt,
  hasDelegation: _hasDelegation,
}) {
  const currentEpoch = useCurrentEpoch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alertMsg, setAlert] = useState(null)
  const [successMsg, setSuccess] = useState(null)
  const [hasDelegation, setHasDelegation] = useState(_hasDelegation)

  const canWithdrawTokenRewards = currentEpoch != null && Number(currentEpoch) > Number(ispo.epochEnd)

  const onWithdrawTokenRewards = async () => {
    setAlert(null)
    setIsSubmitting(true)
    try {
      const txId = await fcl.mutate({
        cadence: withdrawRewardTokens,
        args: (arg, t) => [
          arg(ispoClientId, t.UInt64),
        ],
        limit: 9999,
      })
      await fcl.tx(txId).onceSealed()
      setSuccess('Transaction successfully submitted!')
      setHasDelegation(true) // dirty hack to reflect the change without cache invalidation which we don't have
    } catch (e) {
      setAlert(e.toString())
    }
    setIsSubmitting(false)
  }

  const onWithdrawFlow = async () => {
    setAlert(null)
    setIsSubmitting(true)
    try {
      const txId = await fcl.mutate({
        cadence: withdrawFlowFromIspo,
        args: (arg, t) => [
          arg(ispoClientId, t.UInt64),
        ],
        limit: 9999,
      })
      await fcl.tx(txId).onceSealed()
      setSuccess('Transaction successfully submitted!')
      setHasDelegation(true) // dirty hack to reflect the change without cache invalidation which we don't have
    } catch (e) {
      setAlert(e.toString())
    }
    setIsSubmitting(false)
  }

  return (
    <ISPOCard
      {...ispo}
      body={
        <Box
          display="flex"
          justifyContent="space-around"
          flexWrap="wrap"
          alignItems="center"
          gap={2}
        >
          <IspoDetail
            label="Joined"
            value={new Date(createdAt).toLocaleDateString()}
          />
          <IspoDetail
            label="Earned rewards"
            highlight
            value={`${formatCompactAmount(rewardTokenBalance)} tokens`}
          />
          <IspoDetail
            label="Delegated"
            value={`${formatCompactAmount(hasDelegation ? delegatedFlowBalance : '0.0')} $FLOW`}
          />
        </Box>
      }
      footerContent={
        <>
          <Box sx={{display: 'flex', gap: 2, '& > *': {width: '50%', mt: 1}, mb: 1}}>
            <Tooltip title="You can withdraw rewards after the last ISPO epoch">
              <div>
                <Button variant="outlined" disabled={!canWithdrawTokenRewards} onClick={onWithdrawTokenRewards}>
                  Claim rewards
                </Button>
              </div>
            </Tooltip>
            <Button variant="gradient" disabled={!hasDelegation} onClick={onWithdrawFlow}>
              withdraw flow
            </Button>
          </Box>
          {successMsg && <Alert severity="success" onClose={() => setSuccess(null)}>{successMsg}</Alert>}
          {alertMsg && <Alert severity="error" onClose={() => setAlert(null)} >{alertMsg}</Alert>}
          <Portal>
            <Backdrop
              sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
              open={isSubmitting}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Portal>
        </>
      }
    />
  )
}
