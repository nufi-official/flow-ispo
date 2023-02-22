import Card from "./Card";
import { Box } from "@mui/material";

export default function ISPOCard(props) {
  return (
    <Card title={props.name} {...props} sx={{ minWidth: "200px" }}>
      <Box
        sx={{
          display: "flex",
          gap: 4,
          justifyContent: "space-between",
        }}
      >
        {props.epochStart && (
          <CardValue title="Start epoch" value={props.epochStart} />
        )}
        {props.epochEnd && (
          <CardValue title="End epoch" value={props.epochEnd} />
        )}
        {props.rewardTokenBalance && (
          <CardValue
            title="Reward Tokens"
            value={parseInt(props.rewardTokenBalance)}
          />
        )}
      </Box>
      {props.children}
    </Card>
  );
}

function CardValue({ title, value }) {
  return (
    <Box
      sx={({ typography }) => ({ ...typography.caption, textAlign: "center" })}
    >
      <Box sx={{ fontWeight: "bold", fontSize: "150%" }}>{value}</Box>
      {title}
    </Box>
  );
}
