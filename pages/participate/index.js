import {useState} from 'react'
import {useAccountIspos, useIspos} from '../../hooks/ispo'
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Portal,
  Backdrop,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import * as fcl from '@onflow/fcl'
import delegateToISPO from '../../cadence/web/transactions/client/delegateToISPO.cdc'
import {toUFixString, formatCompactAmount} from '../../helpers/utils'
import useCurrentUser from '../../hooks/useCurrentUser'
import CardGrid from '../../layouts/CardGrid'
import {useCurrentEpoch} from '../../hooks/epochs'

export default function ParticipateIspoPage() {
  const {addr} = useCurrentUser()
  const res = useAccountIspos(addr)

  const ispos = useIspos()
  const currentEpoch = useCurrentEpoch()

  const canJoin = (epochEnd) => Number(currentEpoch) < Number(epochEnd)

  // sort by time of creation
  const sortedIsposByDate =
    ispos &&
    [...ispos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  // sort ended at the and
  // relies on the sort function being stable
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_stability
  const sortedIspos =
    sortedIsposByDate &&
    [...sortedIsposByDate].sort((a, b) =>
      canJoin(a.epochEnd) && !canJoin(b.epochEnd) ? -1 : 1,
    )
  return (
    <CardGrid>
      {sortedIspos?.map((ispo) => (
        <ParticipateCard
          ispoData={ispo}
          key={ispo.id}
          disabled={!canJoin(ispo.epochEnd)}
        />
      ))}
      {sortedIspos?.length === 0 && (
        <Typography variant="h5" sx={{fontWeight: 'bold'}}>
          No offerings found
        </Typography>
      )}
    </CardGrid>
  )
}

function ParticipateCard({ispoData, disabled = false}) {
  const [form, setForm] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alertMsg, setAlert] = useState(null)
  const [successMsg, setSuccess] = useState(null)

  const getRewardPerEpoch = (totalRewardBalance, epochStart, epochEnd) =>
    totalRewardBalance / (epochEnd - epochStart)

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }

  const getOnSubmit = (ispoId) => async () => {
    setIsSubmitting(true)
    try {
      const delegateToIspoTxId = await fcl.mutate({
        cadence: delegateToISPO,
        args: (arg, t) => [
          arg(ispoId, t.UInt64),
          arg(toUFixString(form?.lockedFlowAmount), t.UFix64),
        ],
        limit: 9999,
      })
      await fcl.tx(delegateToIspoTxId).onceSealed()
      window.lastRefresh = new Date()

      setAlert(null)
      setSuccess('Transaction successfully submitted!')
    } catch (e) {
      setAlert(e.toString())
    }
    setIsSubmitting(false)
    setForm({})
  }

  return (
    <ISPOCard
      sx={{opacity: !disabled ? 1 : 0.6}}
      {...ispoData}
      key={ispoData.id}
      body={
        <>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 1,
              mb: 1,
            }}
          >
            <IspoDetail
              label="Delegators"
              value={formatCompactAmount(ispoData.delegationsCount)}
            />
            <IspoDetail
              label="Delegated"
              value={`${formatCompactAmount(
                ispoData.delegatedFlowBalance,
              )} FLOW`}
            />
            <IspoDetail
              label="Token supply"
              value={formatCompactAmount(ispoData.rewardTokenBalance)}
              extraValue={
                ispoData.rewardTokenBalance &&
                ispoData.epochStart &&
                ispoData.epochEnd &&
                `${formatCompactAmount(
                  getRewardPerEpoch(
                    parseInt(ispoData.rewardTokenBalance),
                    ispoData.epochStart,
                    ispoData.epochEnd,
                  ),
                )}/epoch`
              }
            />
          </Box>
          {ispoData.projectDescription && (
            <Typography
              variant="body2"
              color="textSecondary"
              title={ispoData.projectDescription}
              sx={{
                display: '-webkit-box',
                '-webkit-line-clamp': '3',
                '-webkit-box-orient': 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {ispoData.projectDescription}
            </Typography>
          )}
        </>
      }
      footerContent={
        <>
          {!disabled ? (
            <>
              <Box
                component="form"
                display="flex"
                gap={2}
                justifyContent="space-between"
                alignItems="flex-end"
                mb={1}
              >
                <TextField
                  variant="standard"
                  name="lockedFlowAmount"
                  label="Amount FLOW"
                  value={form.lockedFlowAmount || ''}
                  onChange={handleChange}
                />
                <Button
                  variant="gradient"
                  onClick={getOnSubmit(ispoData.id)}
                  sx={{width: 'fit-content'}}
                >
                  Join ISPO
                </Button>
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
              <Portal>
                <Backdrop
                  sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                  }}
                  open={isSubmitting}
                >
                  <CircularProgress color="inherit" />
                </Backdrop>
              </Portal>
            </>
          ) : (
            <Alert
              variant="outlined"
              icon={<EventBusyIcon color="disabled" />}
              sx={({palette}) => ({
                color: palette.text.disabled,
                borderColor: palette.divider,
              })}
              color=""
            >
              The last ISPO epoch already ended
            </Alert>
          )}
        </>
      }
    />
  )
}
