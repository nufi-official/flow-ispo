import React, {createContext, useState} from 'react'

export const GlobalContext = createContext()

export const GlobalContextProvider = ({children}) => {
  const [refreshedAt, setRefreshedAt] = useState(new Date())

  return (
    <GlobalContext.Provider value={{refreshedAt, setRefreshedAt}}>
      {children}
    </GlobalContext.Provider>
  )
}
