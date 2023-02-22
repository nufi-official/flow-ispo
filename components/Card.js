import { Card as MuiCard, Typography } from "@mui/material";

export default function Card(props) {
  return (
    <MuiCard
      {...props}
      sx={{
        margin: "0 auto",
        borderRadius: "20px",
        p: 3,
        ...props.sx,
      }}
      raised
    >
      {props.title && (
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          {props.title}
        </Typography>
      )}
      {props.children}
    </MuiCard>
  );
}
