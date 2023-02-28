import {Card as MuiCard, Typography} from '@mui/material'

export default function Card(props) {
  return (
    <MuiCard
      {...props}
      title={undefined} // one of the props is named 'title' that is propagated by MUI into HTML.That results into undesired display of tooltips over the cards in hover state.
      sx={{
        borderRadius: '20px',
        py: 2.5,
        px: 4,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(5px)',
        boxShadow: ({shadows}) => shadows[4],
        ...props.sx,
      }}
    >
      {props.title && (
        <Typography variant="h6" fontWeight="bold" textAlign="center">
          {props.title}
        </Typography>
      )}
      {props.children}
    </MuiCard>
  )
}
