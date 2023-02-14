import ISPOManager from "../contracts/ISPOManager.cdc"

transaction(id: String) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPO>(from: ISPOManager.ispoStoragePath) != nil {
      panic("ISPO already exists")
    }

    acct.save(
      <-ISPOManager.createISPO(id: id),
      to: ISPOManager.ispoStoragePath
    )

    acct.link<&ISPOManager.ISPO{ISPOManager.ISPOPublic}>(
        ISPOManager.ispoPublicPath,
        target: ISPOManager.ispoStoragePath
    )
  }

  execute {}
}
 