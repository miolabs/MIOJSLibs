import { MIOObject, MIOSortDescriptor } from "../MIOFoundation"
import { MWSRequest, MWSRequestType } from "./MWSRequest";

export class MWSCache extends MIOObject
{
    private static _sharedInstance: MWSCache = null;
    
    private db:IDBDatabase = null;
    private dbName = "dl_manager";
    private dbTableName = "save_blocks";
    
    private isIDBSupported = false;

    static sharedInstance(): MWSCache {

        if (this._sharedInstance == null) {
            this._sharedInstance = new MWSCache();
            this._sharedInstance.init();
            this._sharedInstance.isIDBSupported = window.indexedDB != null ? true : false;
        }

        return this._sharedInstance;
    }

    private _schema:string
    set schema(value:string) {
        this._schema = value;
    }
    
    open(completion:any) {
        if (!this.isIDBSupported) { completion(true); return; }
        if (this.db != null) { completion(true); return }
        
        const request = window.indexedDB.open(this.dbName, 3);

        request.addEventListener('upgradeneeded', () => {
            this.db = request.result;
    
            const objectStore = this.db.createObjectStore(this.dbTableName, { keyPath: 'index', autoIncrement: true });
            objectStore.createIndex('schema', 'schema', { unique: false });
            objectStore.createIndex('transaction', 'transaction', { unique: true });
            // objectStore.createIndex('url', 'url', { unique: false });
            // objectStore.createIndex('method', 'method', { unique: false });
            // objectStore.createIndex('body', 'body', { unique: false });
        });

        request.addEventListener('error', () => {
            console.log(request.error);
            completion(false);
        });

        request.addEventListener('success', () => {
            this.db = request.result;
            completion(true);
        });
    }

    fetch(schema:string, completion: any) {
        if (!this.isIDBSupported) { 
            completion(this.saveBlockQueue); 
            return; 
        }
        
        this.open((status:boolean) => {
            if (status != true) { completion([]); return; }

            const objectStore = this.db.transaction(this.dbTableName).objectStore(this.dbTableName);

            let items = []
            objectStore.openCursor().addEventListener('success', (e) => {
                const cursor = e!.target["result"];
    
                if(cursor){
                    let i = cursor.value;
                    if (i["schema"] == schema) items.addObject(i);
                    cursor.continue()
                }
                else {
                    // No more entries
                    completion(items.sortedArrayUsingDescriptors([MIOSortDescriptor.sortDescriptorWithKey("index", true)]));
                }
            });                    
        });
    }
    
    private saveBlockQueue:MWSRequest[] = []
    save(request:MWSRequest, completion:any) {
        if (!this.isIDBSupported) { 
            this.saveBlockQueue.addObject(request);
            completion(); 
            return; 
        }

        this.open((status:boolean) => {
            if (status != true) { completion(); return; }
            
            let tx = request.transaction;
            let schema = request.schema;
            let url = request.url!.absoluteString;
            let method = request.httpMethod;
            let body = request.body;
            let headers = request.headers;

            let item = { "schema": schema, "transaction": tx, "url": url, "method": method, "body": body, "headers": headers };

            const transaction = this.db.transaction(this.dbTableName, 'readwrite');
            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = () => {                
                // update the display of data to show the newly added item, by running displayData() again.                
                completion(true);
            };

            transaction.onerror = () => {
                completion(false);
            };

            const objectStore = transaction.objectStore(this.dbTableName);
            const objectStoreRequest = objectStore.add(item);
            // objectStoreRequest.onsuccess = (event) => {};
        });
    }

    delete(schema:string, transaction:string, completion:any) {
        if (!this.isIDBSupported) { 
            // TODO: Search and delete transaction from memory cache
            completion(true); 
            return; 
        }

        this.fetch(schema, (items:any[]) => {

            for (let i of items){
                let tx = i["transaction"];
                if (tx != transaction) continue;

                const request = this.db.transaction(this.dbTableName, "readwrite").objectStore(this.dbTableName).delete(i["index"]);
                request.onsuccess = (event) => {
                    // It's gone!
                    completion(true);
                };

                request.onerror = (event) => {
                    completion(false);
                };
            }
        });
    }

}