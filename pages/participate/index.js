import {useState} from 'react'
import {useAccountIspos, useIspos} from '../../hooks/ispo'
import {Alert, Box, Button, TextField, Typography, Chip} from '@mui/material'
import ISPOCard, {IspoDetail} from '../../components/ISPOCard'
import * as fcl from '@onflow/fcl'
import delegateToISPO from '../../cadence/web/transactions/client/delegateToISPO.cdc'
import {toUFixString, formatCompactAmount} from '../../helpers/utils'
import useCurrentUser from '../../hooks/useCurrentUser'

const mockDescription =
  'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati incidunt odio dignissimos eaque! Ex similique quaerat numquam a perspiciatis sit, corrupti ut. Ad laborum ex libero dolor in enim aliquam.'

export default function ParticipateIspoPage() {
  const {addr} = useCurrentUser()
  const res = useAccountIspos(addr)

  const ispos = useIspos()

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      {ispos.map((ispo) => (
        <ParticipateCard ispoData={ispo} key={ispo.id} />
      ))}
    </Box>
  )
}

function ParticipateCard({ispoData}) {
  const [form, setForm] = useState({})
  const [alertMsg, setAlert] = useState(null)

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }

  const getOnSubmit = (ispoId) => (async () => {
    try {
      const delegateToIspoTxId = await fcl.mutate({
        cadence: delegateToISPO,
        args: (arg, t) => [
          arg(ispoId, t.UInt64),
          arg(toUFixString(form?.lockedFlowAmount), t.UFix64),
        ],
        limit: 1000
      })
      await fcl.tx(delegateToIspoTxId).onceSealed()

      setAlert(null)
    } catch (e) {
      setAlert(e.toString())
    }
  })

  return (
    <ISPOCard
      {...ispoData}
      key={ispoData.id}
      projectWebsite="https:nu.fi"
      body={
        <>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <IspoDetail
              label="Delegators"
              value={formatCompactAmount(ispoData.delegationsCount)}
            />
            <IspoDetail
              label="Delegated"
              value={`${formatCompactAmount(ispoData.delegatedFlowBalance)} $FLOW`}
            />
            <IspoDetail
              label="Token supply"
              value={`${formatCompactAmount(ispoData.rewardTokenBalance)}`}
            />
          </Box>
          {(ispoData.description || mockDescription) && (
            <Typography
              variant="body2"
              color="textSecondary"
              title={ispoData.description || mockDescription}
              sx={{
                display: '-webkit-box',
                '-webkit-line-clamp': '3',
                '-webkit-box-orient': 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {ispoData.description || mockDescription}
            </Typography>
          )}
        </>
      }
      footerContent={
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
              label="Locked $FLOW amount"
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
          {alertMsg && <Alert severity="error">{alertMsg}</Alert>}
        </>
      }
    />
  )
}
