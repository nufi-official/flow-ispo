import {Box, Button, Tooltip} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import {useAccountIspos} from '../../hooks/ispo'
import useCurrentUser from '../../hooks/useCurrentUser'
import {formatCompactAmount} from '../../helpers/utils'

export default function MyIspos() {
  const {addr} = useCurrentUser()
  const accountIspos = useAccountIspos(addr)
  return (
    <>
      {accountIspos?.map(({ispo}) => (
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
                label="Delegators"
                value={`${formatCompactAmount(ispo.delegationsCount)}`}
              />
              <IspoDetail
                highlight
                label="Earned rewards:"
                value={`${formatCompactAmount(ispo.rewardTokenBalance)} $FLOW`}
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
    </>
  )
}
