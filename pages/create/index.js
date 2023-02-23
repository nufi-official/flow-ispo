import {CreateIspoForm} from '../../components/CreateIspoForm'
import {Container,Box} from '@mui/material'

export default function CreateIspoPage() {

  return (
    <Box sx={{display: 'flex', minHeight: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <Container maxWidth="sm">
        <CreateIspoForm />
      </Container>
    </Box>
  )
}
