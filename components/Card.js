import {Card as MuiCard, Typography} from '@mui/material'

export default function Card(props) {
  return (
    <MuiCard
      {...props}
      sx={{
        borderRadius: '20px',
        p: 3,
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(5px)',
        boxShadow: ({shadows}) => shadows[1],
        ...props.sx,
      }}
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
  )
}
