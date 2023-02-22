import { useState } from "react";
import { useAccountIspos, useIspos } from "../../hooks/ispo";
import { Alert, Box, Button, MenuItem, Select, TextField } from "@mui/material";
import Card from "../../components/Card";
import * as fcl from "@onflow/fcl";
import delegateToISPO from "../../cadence/web/transactions/client/delegateToISPO.cdc"
import { toUFixString } from "../../helpers/utils";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function ParticipateIspoPage() {
  const { addr } = useCurrentUser();
  const accountIspos = useAccountIspos(addr)

  console.log(accountIspos)

  const ispos = useIspos();
  const [form, setForm] = useState({});
  const [alertMsg, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async () => {
    try {
      console.log(form)
      const delegateToIspoTxId = await fcl.mutate({
        cadence: delegateToISPO,
        args: (arg, t) => [
          arg(Number(form?.ispoId), t.UInt64),
          arg(toUFixString(form?.lockedFlowAmount), t.UFix64),
        ],
      });
      await fcl.tx(delegateToIspoTxId).onceSealed();

      setAlert(null);
    } catch (e) {
      setAlert(e.toString());
    }
  };

  return (
    <Card sx={{width: "300px"}}>
      <Box textAlign="center" component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          "& > *:not(:first-child)": { mt: 2 },
        }}>
        {ispos?.length > 0 ? (<>
          <div>ISPOS:</div>
          <Select
            labelId="ispo-select-label"
            id="ispo-select"
            name="ispoId"
            value={form?.ispoId}
            label="ISPO"
            onChange={handleChange}
          >
            {ispos.map((ispo) =>(
              <MenuItem value={ispo.id} key={ispo.id}>{ispo.name}</MenuItem>
            ))}
          </Select>
          <TextField
            variant="standard"
            name="lockedFlowAmount"
            label="Locked $FLOW amount"
            onChange={handleChange}
          />
          <Button
            variant="outlined"
            onClick={onSubmit}
            sx={{ width: "fit-content", alignSelf: "center" }}
          >
            Join ISPO
          </Button>
        </>) : 'No data'}
        {alertMsg && <Alert severity="error">{alertMsg}</Alert>}
      </Box>
    </Card>
  )
}
 