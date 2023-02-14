pub contract ISPOManager {

    pub struct ISPORecord {
        pub let id: String

        init(
            id: String,
        ) {
            self.id = id
        }
    }

    access(contract) let ispoRecords : {String: ISPORecord}
    pub let ispoStoragePath: StoragePath
    pub let ispoPublicPath: PublicPath

    pub fun getISPORecords(): {String: ISPORecord} {
        return self.ispoRecords
    }

    access(contract) fun recordISPO(id: String) {
        self.ispoRecords.insert(key: id, ISPORecord(id: id))
    }

    access(contract) fun removeISPORecord(id: String) {
        pre {
            self.ispoRecords.containsKey(id): "Cannot remove ISPO record that does not exist"
        }
        self.ispoRecords.remove(key: id)
    }

    // ISPO

    pub resource interface ISPOPublic {
        pub var id: String
    }

    pub resource ISPO: ISPOPublic {
        pub var id: String

        init (id: String) {
            self.id = id
            ISPOManager.recordISPO(id: id)
        }

        destroy() {
          ISPOManager.removeISPORecord(id: self.id)
        }
    }

    pub fun createISPO(id: String): @ISPO {
      return <- create ISPO(id: id)
    }


    init() {
        self.ispoRecords = {}
        self.ispoStoragePath = /storage/ISPO
        self.ispoPublicPath = /public/ISPO
    }
}
 