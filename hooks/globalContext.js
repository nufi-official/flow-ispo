import {useContext} from 'react'
import {GlobalContext} from '../components/GlobalContextProvider'

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)

  return context
}
