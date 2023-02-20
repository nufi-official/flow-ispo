import { Alert, Button, FloatingLabel, Form } from 'react-bootstrap'
import useCurrentUser from '../../hooks/useCurrentUser'
import { CreateIspoForm } from '../../components/CreateIspoForm'

export default function CreateIspoPage() {
  const { addr } = useCurrentUser()

  return (
    <>
      <div>CREATE ISPO? {addr}</div>
      <CreateIspoForm/>
    </>
  )
}