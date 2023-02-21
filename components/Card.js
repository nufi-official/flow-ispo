import { Card as MuiCard, Typography } from "@mui/material";

export default function Card(props) {
  return (
    <MuiCard
      {...props}
      sx={{
        minWidth: "600px",
        margin: "0 auto",
        borderRadius: 5,
        p: 3,
        ...props.sx,
      }}
      raised
    >
      {props.title && (
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {props.title}
        </Typography>
      )}
      {props.children}
    </MuiCard>
  );
}
