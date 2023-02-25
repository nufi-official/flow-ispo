import {ThemeProvider} from '@mui/material/styles'
import Head from 'next/head'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../theme'
import '../styles/globals.css'
import DefaultLayout from '../layouts/DefaultLayout'
// Import Flow config
import '../config/fcl.js'

function MyApp({Component, pageProps}) {
  return (
    <>
      <Head>
        <title>VELES</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <DefaultLayout>
          <CssBaseline />
          <Component {...pageProps} />
        </DefaultLayout>
      </ThemeProvider>
    </>
  )
}

export default MyApp
