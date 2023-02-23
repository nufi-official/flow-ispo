import Head from 'next/head'
import {Button, Box} from '@mui/material'
import Link from 'next/link'

export default function Home() {
  return (
    <Box textAlign="center">
      <Head>
        <title>Flow ISPO</title>
        <meta
          name="description"
          content="Suppport projects by delegating for them."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Flow ISPO</h1>

      <p>Suppport projects by delegating for them. It`s a win-win!</p>

      <Button variant="outlined" component={Link} href="create">
        Create ISPO
      </Button>
      <br />
      <Button
        variant="outlined"
        component={Link}
        href="/participate"
        sx={{mt: 1}}
      >
        Participate
      </Button>
    </Box>
  )
}
