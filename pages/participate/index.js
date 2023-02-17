import useCurrentUser from '../../hooks/useCurrentUser'

export default function ParticipateIspoPage() {
  const { addr } = useCurrentUser()

  return (
    <>
      <div>JOIN {addr}</div>
    </>
  )
}