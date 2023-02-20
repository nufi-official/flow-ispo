import useCurrentUser from '../../hooks/useCurrentUser'
import { useIspos } from '../../hooks/useIspos'

export default function ParticipateIspoPage() {
  const { addr } = useCurrentUser()
  const ispos = useIspos()
  console.log(ispos)

  return (
    <>
      <div>JOIN {addr}</div>
      <div>ISPOS:</div>
      {ispos != null &&
        <ul>
          {ispos.map((ispo) => <li key={ispo.id}>{JSON.stringify(ispo)}</li>)}
        </ul>
      }
    </>
  )
}