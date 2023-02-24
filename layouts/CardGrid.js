import React from 'react'
import {Box,} from '@mui/material'

const CardGrid = ({children}) => {
  return (
    <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          minHeight: '100%',
        pb: 4,

        }}
      >{children}</Box>
  )
}

export default CardGrid