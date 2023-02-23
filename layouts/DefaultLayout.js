import * as fcl from '@onflow/fcl'
import Sidebar from '../components/Sidebar'
import {
  Launch as ExternalIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  Link as MuiLink,
  Toolbar,
  Typography,
} from '@mui/material'
import useCurrentUser from '../hooks/useCurrentUser'
import useConfig from '../hooks/useConfig'
import {useCurrentEpoch} from '../hooks/epochs'

const appTopBar = 64
const sideBarWidth = 320

export default function DefaultLayout({children}) {
  const user = useCurrentUser()
  const config = useConfig()
  const currentEpoch = useCurrentEpoch()

  return (
    <Box
      sx={{
        // adding an svg shape background image for the layout
        // image is positioned absolutely "under" all other elements
        display: 'flex',
        height: '100vh',
        minWidth: '100vw',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: "''",
          position: 'absolute',
          top: 0,
          background: 'gray.400',
          backgroundImage: `url(/shape.svg)`,
          backgroundSize: 'contain',
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.4,
        },
      }}
    >
      <Sidebar width={sideBarWidth} />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          width: '100%',
          height: '100%',
          // adding blur effect on background svg shape
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <AppBar color="transparent" sx={{boxShadow: 'none'}}>
        <Toolbar sx={{justifyContent: 'flex-end', height: appTopBar}}>
          <Box display="flex" gap={2} alignItems="center" mr={2}>
            {user.addr != null && (
              <InfoItem
                label="Address"
                value={
                  <MuiLink
                    target="_blank"
                    sx={{display: 'inline-flex', alignItems: 'center', gap: 1}}
                    href={getFlowAddressExplorerLink(user.addr)}
                  >
                    {user.addr}
                    <ExternalIcon fontSize="inherit" />
                  </MuiLink>
                }
              />
            )}
            {config.network && (
              <InfoItem label="Network" value={config.network} />
            )}
            {currentEpoch != null && (
              <InfoItem label="Current epoch" value={currentEpoch} />
            )}
          </Box>

          {!user.loggedIn && (
            <Button variant="gradient" onClick={fcl.authenticate}>
              Log In <WalletIcon sx={{ml: 0.5}} />
            </Button>
          )}
          {user.loggedIn && (
            <Button variant="gradient" onClick={fcl.unauthenticate}>
              Log Out <WalletIcon sx={{ml: 1}} />
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          zIndex: 1,
          px: 1,
          height: '100%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(60px)',
          pt: `${appTopBar}px`,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            pb: 4,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

function InfoItem({label, value, ...rest}) {
  return (
    <Box sx={{display: 'flex', gap: 1, ...(rest.sx && rest.sx)}}>
      <Typography variant="body2" fontWeight="bold">
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

const flowScanBaseUrl = `https://testnet.flowscan.org`

export const getFlowAddressExplorerLink = (address) =>
  `${flowScanBaseUrl}/account/${address}`
