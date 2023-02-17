import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Button } from 'react-bootstrap'
import Link from 'next/link'

export default function Home() {
  return (
    <div className={styles.container}>
      
      <Head>
        <title>Flow ISPO</title>
        <meta name="description" content="Suppport projects by delegating for them." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Flow ISPO
        </h1>

        <p className={styles.description}>
          Suppport projects by delegating for them. It`s a win-win!
        </p>

        <Link href="/create">
          <Button>Create ISPO</Button>
        </Link>

        <p></p>

        <Link href="/participate">
          <Button>Participate</Button>
        </Link>

      </main>
    </div>
  )
}
