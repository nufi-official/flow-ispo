import {ThemeProvider} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import dynamic from 'next/dynamic'
import theme from '../theme'

import '../styles/globals.css'

const InitFlow = dynamic(() => import('../components/InitFlow'), {
  ssr: false,
})

const Layout = dynamic(() => import('../layouts/DefaultLayout'), {
  ssr: false,
})

function MyApp({Component, pageProps}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InitFlow>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </InitFlow>
    </ThemeProvider>
  )
}

export default MyApp
