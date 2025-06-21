function get(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("keyval-store", 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore("keyval");
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("keyval");
      const store = transaction.objectStore("keyval");
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function set(key, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("keyval-store", 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore("keyval");
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("keyval", "readwrite");
      const store = transaction.objectStore("keyval");
      const setRequest = store.put(value, key);

      setRequest.onsuccess = () => {
        resolve(setRequest.result);
      };

      setRequest.onerror = () => {
        reject(setRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export { get, set };
