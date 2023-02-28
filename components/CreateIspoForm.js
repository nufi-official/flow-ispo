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
  Backdrop,
  CircularProgress,
  Portal,
  InputAdornment,
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
import ispoRewardTokenContract from '../cadence/web/contracts/ISPOExampleRewardToken.cdc'
import {toUFixString} from '../helpers/utils'
import {useCurrentEpoch} from '../hooks/epochs'
import useCurrentUser from '../hooks/useCurrentUser'

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

const tokenFormSectionFields = [
  {
    name: 'contractAddress',
    label: 'Contract address',
    disabled: true,
    startAdornment: null,
  },
  {
    name: 'contractName',
    label: 'Contract name',
    disabled: false,
    startAdornment: null,
  },
  {
    name: 'vaultPath',
    label: 'Vault path',
    disabled: false,
    startAdornment: '/storage/',
  },
  {
    name: 'balancePath',
    label: 'Balance path',
    disabled: false,
    startAdornment: '/public/',
  },
  {
    name: 'receiverPath',
    label: 'Receiver path',
    disabled: false,
    startAdornment: '/public/',
  },
]

function SelectTokenField({
  selectedValue,
  getIsFormSectionValid,
  onFormSectionReset,
}) {
  const [isOpen, setOpen] = useState(false)
  const onClose = async () => {
    if (await getIsFormSectionValid()) {
      setOpen(false)
    }
  }
  const onOpen = () => setOpen(true)

  return (
    <>
      {/* Select lives outside of the form state */}
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
          <MenuItem value="dummy">{selectedValue}</MenuItem>
        </Select>
      </FormControl>
      <Dialog onClose={onClose} open={isOpen}>
        <DialogTitle>Choose token</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > *': {mt: 2},
              width: 400,
            }}
          >
            <Alert severity="info">
              [Hackathon limitation] The ISPO reward token will be
              deployed/minted from the currently logged in account, therefore
              the contract address is currently not editable. In the final
              version, supplying an externally minted token will also be
              possible
            </Alert>
            {/* TODO make contractAddress field reactive to current user address  */}
            {tokenFormSectionFields.map(({startAdornment, ...rest}) => (
              <FormInput
                {...rest}
                key={rest.name}
                InputProps={
                  startAdornment
                    ? {
                        startAdornment: (
                          <InputAdornment position="start">
                            {startAdornment}
                          </InputAdornment>
                        ),
                      }
                    : undefined
                }
              />
            ))}
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
            <Box mr={2}>
              <Button
                variant="outlined"
                onClick={async () => await onFormSectionReset()}
              >
                Reset
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
            .min(
              Number(currentEpoch) + 1,
              `Min allowed epoch is ${Number(currentEpoch) + 1}.`,
            )
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
    // custom token fields
    contractName: yup.string().required(FIELD_REQUIRED_ERROR),
    vaultPath: yup.string().required(FIELD_REQUIRED_ERROR),
    balancePath: yup.string().required(FIELD_REQUIRED_ERROR),
    receiverPath: yup.string().required(FIELD_REQUIRED_ERROR),
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
        <Button onClick={onSuccess} variant="gradient" sx={{mt: 1}}>
          Continue
        </Button>
      </Box>
    )
  }
  return <CreateIspoFormContent {...{onSubmit, currentEpoch}} />
}

const getDefaultTokenValues = async () => {
  const {addr} = await fcl.currentUser.snapshot()

  return {
    contractAddress: addr,
    contractName: 'ISPOExampleRewardToken',
    vaultPath: 'ispoExampleRewardTokenVault',
    balancePath: 'ispoExampleRewardTokenBalance',
    receiverPath: 'ispoExampleRewardTokenReceiver',
  }
}

const DEFAULT_NODE_ID =
  '2b4dac560725d23c016af31567cff35bdcbc6d3e166419d1570de74dd9ecc416'

const validateStakingNode = async (nodeId) => {
  return true
}

function CreateIspoFormContent({onSubmit: _onSubmit, currentEpoch}) {
  const [alertMsg, setAlert] = useState(null)

  const schema = createRegisterSchema({
    currentEpoch,
  })

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: async () => ({
      ...(await getDefaultTokenValues()),
      nodeId: DEFAULT_NODE_ID,
    }),
  })

  const {
    handleSubmit,
    formState: {isSubmitting},
    watch,
    trigger,
    reset,
  } = form

  const onSubmit = async (data) => {
    try {
      const defaultTokenValues = await getDefaultTokenValues()
      const fungibleTokenContractAddr = await fcl.config.get('0xFungibleToken')

      // validate nodeId
      await validateStakingNode(data.nodeId)

      try {
        const tokenContractDeployTx = await fcl.mutate({
          cadence: `
          transaction(name: String, cadence: String) {
            prepare(signer: AuthAccount) {
              let code = cadence.utf8
              signer.contracts.add(name: name, code: code)
            }
          }
          `,
          args: (arg, t) => [
            arg(data.contractName || defaultTokenValues.contractName, t.String),
            arg(
              ispoRewardTokenContract
                .replaceAll(
                  'ISPOExampleRewardToken',
                  data.contractName || defaultTokenValues.contractName,
                )
                .replaceAll('0xFungibleToken', fungibleTokenContractAddr),
              t.String,
            ),
          ],
          limit: 9999,
        })
        await fcl.tx(tokenContractDeployTx).onceSealed()
      } catch (e) {
        // hack - this means the contract has already been deployed earlier
        // and we just skip to the next step as this is not needed
        if (!e.toString().includes('cannot overwrite existing contract')) {
          throw e
        }
      }

      const createIspoTxId = await fcl.mutate({
        cadence: createISPO
          .replaceAll(
            '0xISPOExampleRewardToken',
            data.contractAddress || defaultTokenValues.contractAddress,
          )
          .replaceAll(
            'ISPOExampleRewardToken',
            data.contractName || defaultTokenValues.contractName,
          ),
        args: (arg, t) => [
          arg(data.ispoName, t.String),
          arg(data.projectUrl || '', t.String),
          arg(data.projectDescription || '', t.String),
          arg(data.logoUrl || '', t.String),
          arg(data.nodeId, t.String), // some testnet validator
          arg(data.startEpoch.toString(), t.UInt64),
          arg(data.endEpoch.toString(), t.UInt64),
          arg(data.vaultPath || defaultTokenValues.vaultPath, t.String),
          arg(data.receiverPath || defaultTokenValues.receiverPath, t.String),
          arg(data.balancePath || defaultTokenValues.balancePath, t.String),
          arg(toUFixString(data.totalRewardTokensAmount.toString()), t.UFix64),
        ],
        limit: 9999,
      })
      await fcl.tx(createIspoTxId).onceSealed()
      window.lastRefresh = new Date()

      setAlert(null)
      _onSubmit()
    } catch (e) {
      console.log('e', e.toString())

      const message = e.toString().includes('ISPO already exists')
        ? '[Hackathon version limitation] Currently, only one ISPO per account can be registered'
        : e.toString().includes('NodeID not found')
        ? 'Staking node ID not found'
        : e.toString()

      setAlert(message)
    }
  }

  return (
    <>
      <Card title="Create new ISPO">
        <Alert severity="info" sx={{my: 1}}>
          [Hackathon version limitation] Currently, only one ISPO per account
          can be registered
        </Alert>
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
                defaultValue={Number(currentEpoch) + 1}
              />
              <FormInput name="endEpoch" label="End epoch" type="number" />
              <SelectTokenField
                selectedValue={watch('contractName')}
                getIsFormSectionValid={async () =>
                  trigger(tokenFormSectionFields.map(({name}) => name))
                }
                onFormSectionReset={async () => {
                  const defaultTokenSectionValues =
                    await getDefaultTokenValues()
                  reset((formValues) => ({
                    ...formValues,
                    ...defaultTokenSectionValues,
                  }))
                }}
              />
              <FormInput
                name="totalRewardTokensAmount"
                label="Amount of tokens to distribute"
                type="number"
                InputProps={{
                  startAdornment: (
                    <Tooltip title="The total supply of token that will be distributed among ISPO delegators. For demo purposes just a dummy token with the amount specified will be minted and distributed. In a real ISPO the creator would supply their own token.">
                      <InputAdornment position="start">
                        <InfoIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    </Tooltip>
                  ),
                }}
              />
              <FormInput
                name="nodeId"
                label="Staking node ID"
                type="string"
                InputProps={{
                  startAdornment: (
                    <Tooltip title="ID of the node that users' FLOW will be delegated to">
                      <InputAdornment position="start">
                        <InfoIcon fontSize="small" color="primary" />
                      </InputAdornment>
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
                sx={{width: 'fit-content', alignSelf: 'center', mt: 3}}
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
      <Portal>
        <Backdrop
          sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Portal>
    </>
  )
}
