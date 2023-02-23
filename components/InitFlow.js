import React, {useEffect, useState} from 'react'

export default function InitFlow({children}) {
  const [didInit, setDidInit] = useState(false)

  useEffect(() => {
    require('../config/fcl.js')
    setDidInit(true)
  }, [])

  return <>{children}</>

  if (!didInit) return null
  return children
}
