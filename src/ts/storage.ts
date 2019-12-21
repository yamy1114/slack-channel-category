export default class Storage {
  private static STORAGE_KEY

  public static async initialize(workspaceName) {
    this.STORAGE_KEY = workspaceName
    const data = await this.loadAsync()
    // exec when running on your workspace at first
    if (data == undefined) {
      this.save({})
    }
  }

  public static load(callback) {
    chrome.storage.sync.get(this.STORAGE_KEY, (items) => {
      const data = items[this.STORAGE_KEY]
      callback(data)
    })
  }

  public static loadAsync() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(this.STORAGE_KEY, (items) => {
        resolve(items[this.STORAGE_KEY])
      })
    })
  }

  public static save(data) {
    const saveData = {}
    saveData[this.STORAGE_KEY] = data
    chrome.storage.sync.set(saveData)
  }
}
