import Link from 'next/link'
import {Box, Button, Tooltip, Typography, CircularProgress} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import {useAccountAdminIspos} from '../../hooks/ispo'
import useCurrentUser from '../../hooks/useCurrentUser'
import {formatCompactAmount} from '../../helpers/utils'
import CardGrid from '../../layouts/CardGrid'

export default function MyIspos() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountAdminIspos(addr)
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
      {accountIspos?.map((ispo) => (
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
                label="Delegators"
                value={`${formatCompactAmount(ispo.delegationsCount)}`}
              />
              <IspoDetail
                highlight
                label="Reward tokens"
                value={`${formatCompactAmount(ispo.rewardTokenBalance)} tokens`}
              />
              <IspoDetail
                label="Total locked"
                value={`${formatCompactAmount(
                  ispo.delegatedFlowBalance,
                )} $FLOW`}
              />
            </Box>
          }
          key={ispo.id}
          footerContent={
            <Tooltip title="You can withdraw rewards after the last ISPO epoch">
              <div>
                <Button variant="outlined" sx={{width: '100%'}} disabled>
                  Withdraw rewards
                </Button>
              </div>
            </Tooltip>
          }
        />
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
            No active ISPOs found
          </Typography>
          <Button variant="gradient" component={Link} href="/create">
            Create ISPO{' '}
          </Button>
        </Box>
      )}
    </CardGrid>
  )
}
