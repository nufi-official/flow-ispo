import Head from 'next/head'
import {Button, Box, Typography} from '@mui/material'
import Link from 'next/link'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      textAlign="center"
    >
      <div>
        <Head>
          <title>Veles</title>
          <meta
            name="description"
            content="Suppport projects by delegating for them."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Typography
          sx={{
            justifyContent: 'center',
            fontSize: 30,
            textTransform: 'uppercase',
            letterSpacing: 6,
            fontWeight: 'bold',
            mb: 0,
            lineHeight: 1,
          }}
        >
          <b>Veles</b>
        </Typography>

        <p>Suppport projects by delegating for them. It`s a win-win!</p>

        <Button variant="gradient" component={Link} href="create">
          Create ISPO
        </Button>
        <br />
        <Button
          variant="gradient"
          component={Link}
          href="/participate"
          sx={{mt: 1}}
        >
          Participate
        </Button>
      </div>
    </Box>
  )
}
