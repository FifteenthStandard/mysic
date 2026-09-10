const dbName = 'mysic';
const dbVersion = 1;
const stateStoreName = 'state';

const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(dbName, dbVersion);

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains(stateStoreName)) {
      db.createObjectStore(stateStoreName);
    }
  };

  request.onsuccess = () => {
    resolve(request.result);
  };

  request.onerror = () => {
    reject(request.error);
  };
});

export async function saveDbState(id: string, value: any): Promise<void> {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(stateStoreName, 'readwrite');
    const store = transaction.objectStore(stateStoreName);
    const request = store.put(value, id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export async function getDbState<T>(id: string): Promise<T | undefined> {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(stateStoreName, 'readonly');
    const store = transaction.objectStore(stateStoreName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
