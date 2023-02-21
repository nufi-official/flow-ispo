import useCurrentUser from "../../hooks/useCurrentUser";
import { useIspos } from "../../hooks/useIspos";
import { Box } from "@mui/material";
export default function ParticipateIspoPage() {
  const { addr } = useCurrentUser();
  const ispos = useIspos();
  console.log(ispos);

  return (
    <Box textAlign="center">
      <div>JOIN {addr}</div>
      <div>ISPOS:</div>
      {ispos != null && (
        <ul>
          {ispos.map((ispo) => (
            <li key={ispo.id}>{JSON.stringify(ispo)}</li>
          ))}
        </ul>
      )}
    </Box>
  );
}
