pub contract ISPOManager {

    // ISPORecord
    
    pub resource ISPORecord {
        pub let id: String

        init(
            id: String,
        ) {
            self.id = id
        }
    }

    access(contract) let ispoRecords : @{String: ISPORecord}

    pub fun getISPORecords(): [String] {
        let ispoIds : [String] = [] 
        ISPOManager.ispoRecords.forEachKey(fun (key: String): Bool {
           let ispoRecordRef: &ISPOManager.ISPORecord? = &ISPOManager.ispoRecords[key] as &ISPOManager.ISPORecord?
           ispoIds.append(ispoRecordRef!.id)
           return true
        })
        return ispoIds
    }

    access(contract) fun recordISPO(id: String) {
        self.ispoRecords[id] <-! create ISPORecord(id: id)
    }

    access(contract) fun removeISPORecord(id: String) {
        pre {
            self.ispoRecords.containsKey(id): "Cannot remove ISPO record that does not exist"
        }
        destroy self.ispoRecords.remove(key: id)!
    }

    // ISPO

    pub let ispoStoragePath: StoragePath
    pub let ispoPublicPath: PublicPath

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
        self.ispoRecords <- {}
        self.ispoStoragePath = /storage/ISPO
        self.ispoPublicPath = /public/ISPO
    }
}
 