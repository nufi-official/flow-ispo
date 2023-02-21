import * as fcl from '@onflow/fcl'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { useState } from 'react'
import createISPO from '../cadence/web/transactions/admin/createISPO.cdc'

function toUFixString(numStr) { 
  const num = Number(numStr)
  if (Number.isInteger(num)) { 
    return num + ".0"
  } else {
    return num.toString(); 
  }
}

export function CreateIspoForm() {
  const [alertMsg, setAlert] = useState(null)
  const [form, setForm] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const onSubmit = async () => {
    try {
    const transactionId = await fcl.mutate({
      cadence: createISPO,
      args: (arg, t) => [
        arg(form?.startEpoch, t.UInt64),
        arg(form?.endEpoch, t.UInt64),
        arg('ISPO1Vault', t.String),
        arg('ISPO1Receiver', t.String),
        arg('ISPO1Balance', t.String),
        arg(toUFixString(form?.totalRewardTokensAmount), t.UFix64),
      ]
    })
      const transaction = await fcl.tx(transactionId).onceSealed()
      setAlert(null)
    } catch (e) {
      setAlert(e.toString())
    }
  }

  return (
    <div>
      {alertMsg && 
        <Alert key='danger' variant='danger'>
          {alertMsg}
        </Alert>
      }
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Start epoch</Form.Label>
            <Form.Control type="input" name="startEpoch" placeholder="Start epoch" onChange={handleChange}/>
            <Form.Label>End epoch</Form.Label>
            <Form.Control type="input" name="endEpoch" placeholder="End epoch" onChange={handleChange}/>
            <Form.Label>Total reward tokens amount</Form.Label>
            <Form.Control type="input" name="totalRewardTokensAmount" placeholder="Total reward tokens amount" onChange={handleChange}/>
        </Form.Group>
        <Button variant="primary" onClick={onSubmit}>
            Submit
        </Button>
        </Form>
    </div>
  )
}