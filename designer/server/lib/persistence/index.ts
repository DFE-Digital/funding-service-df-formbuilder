//import { CosmosPersistenceService } from "./cosmosPersistenceService";
import { BlobPersistenceService } from "./blobPersistenceService";
import { StubPersistenceService } from "./persistenceService";
import { PreviewPersistenceService } from "./previewPersistenceService";

type Name = "cosmos" | "blob" | "preview";

export function determinePersistenceService(name: Name, server: any) {
    switch (name) {
        // case "cosmos":
        //     return () => new CosmosPersistenceService(server);
        case "blob":
            return () => new BlobPersistenceService();
        case "preview":
            return () => new PreviewPersistenceService();
        default:
            return () => new StubPersistenceService();
    }
}
