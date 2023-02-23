import Link from 'next/link'
import {Box, Button, Tooltip, Typography} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import {useAccountIspos} from '../../hooks/ispo'
import useCurrentUser from '../../hooks/useCurrentUser'
import {formatCompactAmount} from '../../helpers/utils'
import CardGrid from '../../layouts/CardGrid'

export default function MyParticipations() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountIspos(addr)

  return (
    <CardGrid>
      {accountIspos?.map(
        ({ispo, delegatedFlowBalance, rewardTokenBalance, createdAt}) => (
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
        ),
      )}
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
