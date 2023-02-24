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
import * as fcl from '@onflow/fcl'

export default function MyParticipations() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountIspos(addr)

  return (
    <CardGrid>
      {!addr && (
        <Box>
          <Typography variant="h5" sx={{fontWeight: 'bold'}}>
            You are not logged in
          </Typography>
        </Box>
      )}
      {!accountIspos && !!addr && <CircularProgress />}
      {accountIspos?.map((data) => (
        <MyParticipationCard {...data} key={data.id} />
      ))}
      {accountIspos?.length === 0 && (
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
  ispo,
  delegatedFlowBalance,
  rewardTokenBalance,
  createdAt,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alertMsg, setAlert] = useState(null)
  const [successMsg, setSuccess] = useState(null)

  const onWithdrawFlow = async () => {
    setAlert(null)
    setIsSubmitting(true)
    try {
      // mock
      await new Promise((res) => setTimeout(res, 5000))
      const delegateToIspoTxId = await fcl.mutate({
        cadence: withdrawFlowFromIspo,
        args: (arg, t) => [
          // arg(ispoClientId, t.UInt64),
        ],
        limit: 10000,
      })
      await fcl.tx(delegateToIspoTxId).onceSealed()
      setSuccess('Transaction successfully submitted!')
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
            value={`${formatCompactAmount(delegatedFlowBalance)} $FLOW`}
          />
        </Box>
      }
      footerContent={
        <>
          <Box sx={{display: 'flex', gap: 2, '& > *': {width: '50%'}, mb: 1}}>
            <Tooltip title="You can withdraw rewards after the last ISPO epoch">
              <div>
                <Button variant="outlined" disabled>
                  Claim rewards
                </Button>
              </div>
            </Tooltip>
            <Button variant="gradient" onClick={onWithdrawFlow}>
              withdraw flow
            </Button>
          </Box>
          {successMsg && <Alert severity="success" onClose={() => setSuccess(null)}>{successMsg}</Alert>}
          {alertMsg && <Alert severity="error">{alertMsg}</Alert>}
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
