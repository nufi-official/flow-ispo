import {CreateIspoForm} from '../../components/CreateIspoForm'
import {Container, Box, Typography} from '@mui/material'
import useCurrentUser from '../../hooks/useCurrentUser'

export default function CreateIspoPage() {
  const {addr} = useCurrentUser()

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        {!addr && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              pb: 4,
            }}
          >
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>
              You are not logged in
            </Typography>
          </Box>
        )}
        {addr && <CreateIspoForm />}
      </Container>
    </Box>
  )
}
