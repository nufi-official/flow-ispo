import * as fcl from "@onflow/fcl";
import { useState } from "react";
import { Button, Alert, TextField, Box } from "@mui/material";
import Card from "./Card";
import createISPO from "../cadence/web/transactions/admin/createISPO.cdc";
import mintRewardToken from "../cadence/web/transactions/admin/mintRewardToken.cdc";
import { toUFixString } from "../helpers/utils";

export function CreateIspoForm() {
  const [alertMsg, setAlert] = useState(null);
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async () => {
    try {
      const mintTxId = await fcl.mutate({
        cadence: mintRewardToken,
        args: (arg, t) => [
          arg(toUFixString(form?.totalRewardTokensAmount), t.UFix64),
        ],
      });
      await fcl.tx(mintTxId).onceSealed();
      const createIspoTxId = await fcl.mutate({
        cadence: createISPO,
        args: (arg, t) => [
          arg(form?.ispoName, t.String),
          arg(form?.startEpoch, t.UInt64),
          arg(form?.endEpoch, t.UInt64),
          arg("ispoExampleRewardTokenVault", t.String),
          arg("ispoExampleRewardTokenReceiver", t.String),
          arg("ispoExampleRewardTokenBalance", t.String),
          arg(toUFixString(form?.totalRewardTokensAmount), t.UFix64),
        ],
      });
      await fcl.tx(createIspoTxId).onceSealed();

      setAlert(null);
    } catch (e) {
      setAlert(e.toString());
    }
  };

  return (
    <Card title="Create new ISPO">
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          "& > *:not(:first-child)": { mt: 2 },
        }}
      >
        <TextField
          variant="standard"
          name="ispoName"
          label="Name"
          onChange={handleChange}
        />
        <TextField
          variant="standard"
          name="startEpoch"
          label="Start epoch"
          onChange={handleChange}
        />
        <TextField
          variant="standard"
          name="endEpoch"
          label="End epoch"
          onChange={handleChange}
        />
        <TextField
          variant="standard"
          name="totalRewardTokensAmount"
          label="Total reward tokens amount"
          onChange={handleChange}
        />
        <Button
          variant="outlined"
          onClick={onSubmit}
          sx={{ width: "fit-content", alignSelf: "center" }}
        >
          Submit
        </Button>
        {alertMsg && <Alert severity="error">{alertMsg}</Alert>}
      </Box>
    </Card>
  );
}
