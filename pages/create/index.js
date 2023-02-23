import {Container} from '@mui/material'
import dynamic from 'next/dynamic'

const CreateIspoForm = dynamic(
  () => import('../../components/CreateIspoForm'),
  {
    ssr: false,
  },
)

export default function CreateIspoPage() {
  return (
    <Container maxWidth="sm">
      <CreateIspoForm />
    </Container>
  )
}
