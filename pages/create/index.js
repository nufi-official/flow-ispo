import useCurrentUser from '../../hooks/useCurrentUser'
import {CreateIspoForm} from '../../components/CreateIspoForm'
import {Container} from '@mui/material'
import {useAccountIspos} from '../../hooks/ispo'

export default function CreateIspoPage() {
  const {addr} = useCurrentUser()

  return (
    <Container maxWidth="sm">
      <CreateIspoForm />
    </Container>
  )
}
