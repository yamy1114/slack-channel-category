export default class Storage {
  private STORAGE_KEY

  constructor(workspace_name) {
    this.STORAGE_KEY = workspace_name
    this.initialize()
  }

  public load(callback) {
    chrome.storage.sync.get(this.STORAGE_KEY, (items) => {
      const data = items[this.STORAGE_KEY]
      callback(data)
    })
  }

  public save(data) {
    const saveData = {}
    saveData[this.STORAGE_KEY] = data
    chrome.storage.sync.set(saveData)
  }

  private initialize() {
    this.load((data) => {
      // exec when running on your workspace at first
      if (data == undefined) {
        this.save({})
      }
    })
  }
}
