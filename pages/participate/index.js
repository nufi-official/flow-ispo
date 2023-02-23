import dynamic from 'next/dynamic'

const Participate = dynamic(() => import('../../components/Participate'), {
  ssr: false,
})

export default function ParticipatePage() {
  return <Participate />
}
