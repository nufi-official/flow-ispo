import Link from 'next/link'
import {
  Box,
  Button,
  Tooltip,
  Typography,
  CircularProgress,
  Portal,
  Backdrop,
  Alert,
} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import {useAccountAdminIspos} from '../../hooks/ispo'
import useCurrentUser from '../../hooks/useCurrentUser'
import {formatCompactAmount} from '../../helpers/utils'
import CardGrid from '../../layouts/CardGrid'
import withdrawAdminRewards from '../../cadence/web/transactions/admin/withdrawAdminRewards.cdc'
import {useState} from 'react'
import * as fcl from '@onflow/fcl'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import {useGlobalContext} from '../../hooks/globalContext'

export default function MyIspos() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountAdminIspos(addr)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alertMsg, setAlert] = useState(null)
  const [successMsg, setSuccess] = useState(null)
  const {setRefreshedAt} = useGlobalContext()

  const onWithdrawFlow = async () => {
    setAlert(null)
    setIsSubmitting(true)
    try {
      const txId = await fcl.mutate({
        cadence: withdrawAdminRewards,
        args: (arg, t) => [],
        limit: 9999,
      })
      await fcl.tx(txId).onceSealed()
      setRefreshedAt(new Date())
      setSuccess('Transaction successfully submitted!')
    } catch (e) {
      setAlert(e.toString())
    }
    setIsSubmitting(false)
  }

  return (
    <CardGrid>
      {!accountIspos && !!addr && <CircularProgress />}
      {accountIspos?.map((ispo) => (
        <ISPOCard
          {...ispo}
          body={
            <Box
              display="flex"
              justifyContent="space-around"
              flexWrap="wrap"
              alignItems="center"
              gap={1}
            >
              <IspoDetail
                label="Delegators"
                value={`${formatCompactAmount(ispo.delegationsCount)}`}
              />
              <IspoDetail
                label="Total locked"
                value={`${formatCompactAmount(ispo.delegatedFlowBalance)} FLOW`}
              />
              <IspoDetail
                highlight
                label="Staking rewards"
                value={`${formatCompactAmount(ispo.flowRewardsBalance)} FLOW`}
              />
              <IspoDetail
                highlight
                label="Reward tokens"
                value={`${formatCompactAmount(ispo.rewardTokenBalance)} tokens`}
              />
            </Box>
          }
          key={ispo.id}
          footerContent={
            <div>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  '& > *': {width: '100%', mt: 1},
                  mb: 1,
                }}
              >
                <Tooltip title='For the sake of the demonstration, even zero rewards can be "withdrawn"'>
                  <Button variant="gradient" onClick={onWithdrawFlow}>
                    <Box mr={1} mt={1}>
                      <InfoIcon fontSize="small" />
                    </Box>
                    Withdraw staking rewards
                  </Button>
                </Tooltip>
              </Box>
              {successMsg && (
                <Alert severity="success" onClose={() => setSuccess(null)}>
                  {successMsg}
                </Alert>
              )}
              {alertMsg && (
                <Alert severity="error" onClose={() => setAlert(null)}>
                  {alertMsg}
                </Alert>
              )}
            </div>
          }
        />
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
            No ISPOs found
          </Typography>
          <Button variant="gradient" component={Link} href="/create">
            Create ISPO{' '}
          </Button>
        </Box>
      )}
      <Portal>
        <Backdrop
          sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Portal>
    </CardGrid>
  )
}
