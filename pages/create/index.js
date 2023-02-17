import useCurrentUser from '../../hooks/useCurrentUser'

export default function CreateIspoPage() {
  const { addr } = useCurrentUser()

  return (
    <>
      <div>CREATE ISPO? {addr}</div>
    </>
  )
}