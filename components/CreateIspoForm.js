import * as fcl from '@onflow/fcl'
import Button from 'react-bootstrap/Button'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { useReducer, useState } from 'react'
import CreateTalk from '../cadence/transactions/CreateTalk.cdc'


export function CreateIspoForm({ onMint }) {
  const [mintData, setMintData] = useReducer(
    (data, newData) => ({ ...data, ...newData }),
    { text: '', tweetID: null }
  )
  const [showAlert, setShowAlert] = useState(false)
  const [form, setForm] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const onSubmit = async () => {
    console.log(form)
    // TODO submit tx to FCL
    /*
    await fcl.mutate({
      cadence: CreateTalk,
      args: (arg, t) => [
        arg(mintData?.text, t.String),
        arg(mintData?.tweetID, t.Optional(t.String))
      ]
    })

    setShowAlert(false)
    setMintData({ text: '' })
    onMint()*/
  }

  return (
    <div>
      {showAlert && 
        <Alert key='danger' variant='danger'>
          You have to write something. Can you block the talk?
        </Alert>
      }
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Start epoch</Form.Label>
            <Form.Control type="input" name="startEpoch" placeholder="Start epoch" onChange={handleChange}/>
            <Form.Label>End epoch</Form.Label>
            <Form.Control type="input" name="endEpoch" placeholder="End epoch" onChange={handleChange}/>
            <Form.Label>End epoch</Form.Label>
            <Form.Control type="input" name="totalRewardTokensAmount" placeholder="Total reward tokens amount" onChange={handleChange}/>
        </Form.Group>
        <Button variant="primary" onClick={onSubmit}>
            Submit
        </Button>
        </Form>
    </div>
  )
}