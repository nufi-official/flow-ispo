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
          <title>VELES</title>
          <meta
            name="description"
            content="Suppport projects by delegating for them."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Typography
          sx={{
            justifyContent: 'center',
            fontSize: 50,
            textTransform: 'uppercase',
            letterSpacing: 6,
            fontWeight: 'bold',
            mb: 0,
            lineHeight: 1,
          }}
        >
          <b>Veles</b>
        </Typography>

        <p>
          <Typography variant="h6">
            Suppport projects by delegating your <b>FLOW tokens</b> & earn{' '}
            <b>ISPO rewards</b>.
            <br />
            It&#39;s a <b>win-win</b> kind of delegation!
          </Typography>
        </p>

        <Button
          variant="gradient-solid"
          component={Link}
          href="/participate"
          sx={{width: 200, height: 60, fontSize: 18, mt: 2}}
        >
          Participate
        </Button>
        <br />
        <Button
          variant="gradient"
          component={Link}
          href="create"
          sx={{width: 200, height: 60, fontSize: 18, mt: 1.5}}
        >
          Create ISPO
        </Button>
      </div>
    </Box>
  )
}
