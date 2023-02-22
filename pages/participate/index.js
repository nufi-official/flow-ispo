import { useState } from "react";
import { useIspos } from "../../hooks/useIspos";
import { Alert, Box, Button, TextField } from "@mui/material";
import ISPOCard from "../../components/ISPOCard";
import * as fcl from "@onflow/fcl";
import delegateToISPO from "../../cadence/web/transactions/client/delegateToISPO.cdc";
import { toUFixString } from "../../helpers/utils";

export default function ParticipateIspoPage() {
  const ispos = useIspos();
  const [form, setForm] = useState({});
  const [alertMsg, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async () => {
    try {
      console.log(form);
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
    <>
      {ispos.map((ispo) => (
        <ISPOCard {...ispo}>
          <Box
            textAlign="center"
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              "& > *:not(:first-child)": { mt: 2 },
            }}
          >
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
            {alertMsg && <Alert severity="error">{alertMsg}</Alert>}
          </Box>
        </ISPOCard>
      ))}
    </>
  );
}
