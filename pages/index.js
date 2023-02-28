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
            mb: 1,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <img src="/veleslogo.png" alt="Veles logo" height={60} width={60} />
          <b>Veles</b>
        </Typography>

        <Typography variant="h6">
          <b>Staking-powered fundraising on Flow.</b>Support a project by
          staking FLOW and letting the project claim the staking rewards on your
          behalf to use as funding. In return, you&#39;ll get the project&#39;s
          new token. Win-win!.
        </Typography>

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
