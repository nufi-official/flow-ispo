import * as fcl from '@onflow/fcl'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import * as yup from 'yup'
import {
  Button,
  Alert,
  TextField,
  Box,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import {
  Controller,
  useForm,
  useFormContext,
  FormProvider,
} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import Card from './Card'
import createISPO from '../cadence/web/transactions/admin/createISPO.cdc'
import {toUFixString} from '../helpers/utils'
import {useCurrentEpoch} from '../hooks/epochs'

const FormInput = ({name, defaultValue, ...otherProps}) => {
  const {
    control,
    formState: {errors},
  } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue || ''}
      render={({field}) => {
        const onChange =
          otherProps.type === 'number'
            ? (e) => {
                field.onChange(
                  e.target.value === '' ? '' : parseInt(e.target.value, 10),
                )
              }
            : field.onChange

        return (
          <TextField
            variant="standard"
            onKeyPress={(e) => {
              if (
                otherProps.type === 'number' &&
                (e.key === 'e' || e.key === '-')
              ) {
                e.preventDefault()
              }
            }}
            {...otherProps}
            {...field}
            onChange={onChange}
            error={!!errors[name]}
            helperText={errors[name] ? errors[name].message : ''}
          />
        )
      }}
    />
  )
}

function SelectTokenField() {
  const [isOpen, setOpen] = useState(false)
  const onClose = () => setOpen(false)
  const onOpen = () => setOpen(true)

  const [contactAddress, setContactAddress] = useState('Loading ...')
  useEffect(() => {
    const couldNotLoadAddressText = 'Could not load address'
    const fn = async () => {
      try {
        const res = await fcl.config.get('0xISPOExampleRewardToken')
        setContactAddress(res || couldNotLoadAddressText)
      } catch (err) {
        setContactAddress(couldNotLoadAddressText)
      }
    }
    fn()
  }, [])

  return (
    <>
      <FormControl>
        <InputLabel variant="standard">Token</InputLabel>
        <Select
          variant="standard"
          value="dummy"
          label="Token"
          open={false}
          onClick={(e) => {
            onOpen()
          }}
          InputProps={{
            startAdornment: <InfoIcon fontSize="small" />,
          }}
        >
          <MenuItem value="dummy">Dummy token</MenuItem>
        </Select>
      </FormControl>
      <Dialog onClose={onClose} open={isOpen}>
        <DialogTitle>Choose token</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            We do not yet support choosing your own token. For the demo purposes
            we instead mint a dummy testing token whose info is shown below.
          </Alert>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > *': {mt: 2},
            }}
          >
            <FormInput
              name="contractAddress"
              label="Contract address"
              disabled
              defaultValue={contactAddress}
            />
            <FormInput
              name="contractName"
              label="Contract name"
              disabled
              defaultValue="ISPOExampleRewardToken"
            />
            <FormInput
              name="symbol"
              label="Symbol"
              disabled
              defaultValue="ISPO-TEST"
            />
            <FormInput
              name="valuePath"
              label="Value path"
              disabled
              defaultValue="/storage/ispoExampleRewardTokenVault"
            />
            <FormInput
              name="balancePath"
              label="Balance path"
              disabled
              defaultValue="/public/ispoExampleRewardTokenBalance"
            />
            <FormInput
              name="receiverPath"
              label="Receiver path"
              disabled
              defaultValue="/public/ispoExampleRewardTokenReceiver"
            />
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: 2}}>
            <Box mr={2}>
              <Button variant="outlined" onClick={onClose}>
                Close
              </Button>
            </Box>
            <Button variant="contained" onClick={onClose}>
              Confirm
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

const FIELD_REQUIRED_ERROR = 'Field is required.'
const FIELD_INVALID_TYPE_ERROR = 'Invalid value.'
const NUMBER_FIELD_BASE_VALIDATION = {
  invalid_type_error: FIELD_INVALID_TYPE_ERROR,
  required_error: FIELD_REQUIRED_ERROR,
}

const MAX_ALLOWED_EPOCH = Number.MAX_SAFE_INTEGER
const MAX_ALLOWED_TOKENS_AMOUNT = Number.MAX_SAFE_INTEGER

const createRegisterSchema = ({currentEpoch}) => {
  return yup.object().shape({
    ispoName: yup
      .string()
      .required(FIELD_REQUIRED_ERROR)
      .max(32, 'Name must be shorter than 32 characters.'),
    projectUrl: yup.string().url('Project url must be a valid url.'),
    projectDescription: yup
      .string()
      .max(1024, 'Description must be shorter than 1024 characters.'),
    logoUrl: yup.string().url('Logo url must be a valid url.'),
    startEpoch: yup.lazy((value) =>
      value === ''
        ? yup.string().required(FIELD_REQUIRED_ERROR)
        : yup
            .number()
            .required(FIELD_REQUIRED_ERROR)
            .min(currentEpoch + 1, `Min allowed epoch is ${currentEpoch + 1}.`)
            .max(
              MAX_ALLOWED_EPOCH - 1,
              `Max allowed epoch is ${MAX_ALLOWED_EPOCH - 1}.`,
            )
            .typeError(FIELD_INVALID_TYPE_ERROR),
    ),
    endEpoch: yup.lazy((value) =>
      value === ''
        ? yup.string().required(FIELD_REQUIRED_ERROR)
        : yup
            .number()
            .required(FIELD_REQUIRED_ERROR)
            .max(MAX_ALLOWED_EPOCH, `Max allowed epoch is ${MAX_ALLOWED_EPOCH}`)
            .typeError(FIELD_INVALID_TYPE_ERROR)
            .test(
              'epochs-are-correct',
              'End epoch must be greater than start epoch.',
              function (value) {
                if (isNaN(value) || isNaN(this.parent.startEpoch)) return true
                if (value === '' || this.parent.startEpoch === '') return true
                return this.parent.startEpoch < value
              },
            ),
    ),
    totalRewardTokensAmount: yup.lazy((value) =>
      value === ''
        ? yup.string().required(FIELD_REQUIRED_ERROR)
        : yup
            .number(NUMBER_FIELD_BASE_VALIDATION)
            .max(
              MAX_ALLOWED_TOKENS_AMOUNT,
              `Value must be lower than ${MAX_ALLOWED_TOKENS_AMOUNT + 1}`,
            )
            .required(FIELD_REQUIRED_ERROR)
            .typeError(FIELD_INVALID_TYPE_ERROR),
    ),
  })
}

export function CreateIspoForm() {
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const currentEpoch = useCurrentEpoch()

  const onSuccess = () => {
    router.push('/participate')
  }

  const onSubmit = () => {
    setSubmitted(true)
  }

  if (currentEpoch == null) return null

  if (submitted) {
    return (
      <Box
        sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
      >
        <Typography variant="h4" mb={1}>
          ISPO successfully created!
        </Typography>
        <Button onClick={onSuccess} variant="contained">
          Continue
        </Button>
      </Box>
    )
  }
  return <CreateIspoFormContent {...{onSubmit, currentEpoch}} />
}

function CreateIspoFormContent({onSubmit: _onSubmit, currentEpoch}) {
  const [alertMsg, setAlert] = useState(null)

  const schema = createRegisterSchema({
    currentEpoch,
  })

  const form = useForm({
    resolver: yupResolver(schema),
  })

  const {
    handleSubmit,
    formState: {isSubmitting},
  } = form

  const onSubmit = async (data) => {
    try {
      const createIspoTxId = await fcl.mutate({
        cadence: createISPO,
        args: (arg, t) => [
          arg(data.ispoName, t.String),
          arg(data.projectUrl || '', t.String),
          arg(data.projectDescription || '', t.String),
          arg(data.logoUrl || '', t.String),
          arg(
            '2b4dac560725d23c016af31567cff35bdcbc6d3e166419d1570de74dd9ecc416',
            t.String,
          ), // some testnet validator
          arg(data.startEpoch.toString(), t.UInt64),
          arg(data.endEpoch.toString(), t.UInt64),
          arg('ispoExampleRewardTokenVault', t.String),
          arg('ispoExampleRewardTokenReceiver', t.String),
          arg('ispoExampleRewardTokenBalance', t.String),
          arg(toUFixString(data.totalRewardTokensAmount.toString()), t.UFix64),
        ],
      })
      await fcl.tx(createIspoTxId).onceSealed()

      setAlert(null)
      _onSubmit()
    } catch (e) {
      console.log('e', e.toString())

      const message = e.toString().includes('Code: 1101')
        ? 'Currently, only one ISPO per account can be registered'
        : e.toString()

      setAlert(message)
    }
  }

  return (
    <Card title="Create new ISPO">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > *:not(:first-child)': {mt: 2},
            }}
          >
            <FormInput name="ispoName" label="Name" />
            <FormInput
              name="startEpoch"
              label="Start epoch"
              type="number"
              defaultValue={currentEpoch + 1}
            />
            <FormInput name="endEpoch" label="End epoch" type="number" />
            <SelectTokenField />
            <FormInput
              name="totalRewardTokensAmount"
              label="Amount of tokens to distribute"
              type="number"
              InputProps={{
                startAdornment: (
                  <Tooltip title="The total supply of token that will be distributed among ISPO delegators. For demo purposes just a dummy token with the amount specified will be minted and distributed. In a real ISPO the creator would supply their own token.">
                    <Box mr={1}>
                      <InfoIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                ),
              }}
            />
          </Box>

          <Typography
            variant="subtitle1"
            mt={5}
            align="center"
            fontWeight="bold"
          >
            Optional fields
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > *:not(:first-child)': {mt: 2},
            }}
          >
            <FormInput name="projectUrl" label="Project URL" />
            <FormInput name="logoUrl" label="Logo URL" />
            <FormInput
              name="projectDescription"
              label="Project Description"
              multiline
              minRows={2}
              maxRows={5}
            />
          </Box>

          <Box display="flex" flexDirection="column">
            <Button
              variant="gradient"
              disabled={isSubmitting}
              type="submit"
              sx={{width: 'fit-content', alignSelf: 'center', mt: 2}}
            >
              Submit
            </Button>
          </Box>
          {alertMsg && (
            <Box mt={2}>
              <Alert severity="error" onClose={() => setAlert(null)}>
                {alertMsg}
              </Alert>
            </Box>
          )}
        </form>
      </FormProvider>
    </Card>
  )
}
