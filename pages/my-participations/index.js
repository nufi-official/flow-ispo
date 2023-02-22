import {Chip, Box, Button, Tooltip} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import {useAccountIspos} from '../../hooks/ispo'
import useCurrentUser from '../../hooks/useCurrentUser'
import {formatCompactAmount} from '../../helpers/utils'

export default function MyParticipations() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountIspos(addr)
  return (
    <>
      {accountIspos?.map(({ispo, delegatedFlowBalance, createdAt}) => (
        <ISPOCard
          {...ispo}
          projectWebsite="https:nu.fi"
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
                value={`${formatCompactAmount(ispo.rewardTokenBalance)} tokens`}
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
      ))}
    </>
  )
}
