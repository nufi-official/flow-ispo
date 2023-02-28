import ISPOManager from 0xf8d6e0586b0a20c7

pub fun main(): [ISPOManager.ISPOInfo] {
  var ispoAdmin = getAuthAccount(0xf8d6e0586b0a20c7).borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath)

  if ispoAdmin == nil {
    return []
  }


  return ispoAdmin!.getIspoInfos()
}
 