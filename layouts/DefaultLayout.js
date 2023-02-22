import * as fcl from '@onflow/fcl'
import Sidebar from '../components/Sidebar'
import {AppBar, Box, Button, Card, Toolbar, Typography} from '@mui/material'
import useCurrentUser from '../hooks/useCurrentUser'
import useConfig from '../hooks/useConfig'
import {useCurrentEpoch} from '../hooks/epochs'

const appTopBar = 64
const sideBarWidth = 320

export default function DefaultLayout({children}) {
  const user = useCurrentUser()

  return (
    <Box
      display="flex"
      minHeight="100vh"
      sx={{
        // adding an svg shape background image for the layout
        // image is positioned absolutely "under" all other elements
        position: 'relative',
        '&:before': {
          content: "''",
          position: 'absolute',
          top: 0,
          background: 'gray.400',
          backgroundImage: `url(/shape.svg)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.4,
        },
      }}
    >
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
      <Sidebar width={sideBarWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: `${appTopBar}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <AppBar color="transparent" sx={{boxShadow: 'none'}}>
          <Toolbar sx={{justifyContent: 'flex-end', height: appTopBar}}>
            {!user.loggedIn && (
              <Button variant="contained" onClick={fcl.authenticate}>
                Log In With Wallet
              </Button>
            )}
            {user.loggedIn && (
              <Button variant="contained" onClick={fcl.unauthenticate}>
                Log Out Of Wallet
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Info />
        {children}
      </Box>
    </Box>
  )
}

function Info() {
  const config = useConfig()
  const user = useCurrentUser()
  const currentEpoch = useCurrentEpoch()

  return (
    <Box sx={{position: 'fixed', right: 25, top: 60}}>
      <Box sx={{display: 'flex', flexDirection: 'column', minWidth: 180}}>
        {user.addr != null && <InfoItem label="Address" value={user.addr} />}
        {config.network && <InfoItem label="Network" value={config.network} />}
        {currentEpoch != null && (
          <InfoItem label="Current epoch" value={currentEpoch} />
        )}
      </Box>
    </Box>
  )
}

function InfoItem({label, value}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <Typography variant="overline" fontWeight="bold" mr={2}>
        {label}:
      </Typography>
      <Typography variant="overline">{value}</Typography>
    </Box>
  )
}
