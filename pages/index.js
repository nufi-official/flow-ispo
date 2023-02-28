import Head from 'next/head'
import {Button, Box, Typography, Link as MuiLink, Divider} from '@mui/material'
import {Launch as ExternalIcon} from '@mui/icons-material'
import Link from 'next/link'
import {learnMoreLink} from '../constants'

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
          <b>Staking-powered fundraising on Flow.</b>&#160;Support a project by
          staking FLOW
          <br /> and letting the project claim the staking rewards on your
          behalf to use as
          <br /> funding. In return, you&#39;ll get the project&#39;s new token.
          Win-win!.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
            my: 2,
          }}
        >
          <Button
            variant="gradient-solid"
            component={Link}
            href="/participate"
            size="large"
            sx={{width: 200, height: 50, fontSize: 18}}
          >
            Participate
          </Button>
          <br />
          <Button
            variant="gradient"
            component={Link}
            href="create"
            sx={{width: 200, height: 50, fontSize: 18}}
          >
            Create ISPO
          </Button>
        </Box>
        <Divider sx={{my: 2}} />
        <Box sx={{textAlign: 'left', mb: 2}}>
          <div>
            <Typography variant="h6">
              <b>Faucet</b>
            </Typography>
            To fund your testnet account, you can use{' '}
            <MuiLink
              color="info.main"
              target="_blank"
              href="https://testnet-faucet.onflow.org/fund-account"
              underline="hover"
            >
              Flow faucet
            </MuiLink>
            .
          </div>
        </Box>
        <Box sx={{textAlign: 'left'}}>
          <div>
            <Typography variant="h6">
              <b>Testnet wallet</b>
            </Typography>
            If you don't have any testnet wallet, you can download NuFi testnet
            wallet{' '}
            <MuiLink
              color="info.main"
              href={
                'https://assets.nu.fi/extension/testnet/nufi-cwe-testnet-latest.zip'
              }
              underline="hover"
            >
              here
            </MuiLink>
            . <br />
            In order to install it, please follow steps bellow.
            <ol>
              <li>
                Open Extensions page in your browser at:{' '}
                <b>chrome://extensions/</b>.
              </li>
              <li>
                Make sure the Developer Mode is enabled (upper right corner).
              </li>
              <li>
                Drag and drop downloaded .zip file to the Extensions page.
              </li>
            </ol>
          </div>
        </Box>
        <Divider sx={{my: 2}} />
        <MuiLink
          underline="hover"
          variant="h6"
          href={learnMoreLink}
          target="_blank"
          sx={{
            color: 'info.main',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5em',
          }}
        >
          Learn more about Veles
          <ExternalIcon fontSize="inherit" />
        </MuiLink>
      </div>
    </Box>
  )
}
