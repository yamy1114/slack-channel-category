import Logger from './logger'

export default class Storage {
  private STORAGE_KEY

  constructor(workspace_name) {
    this.STORAGE_KEY = workspace_name
    this.initialize()
  }

  public load(callback) {
    chrome.storage.sync.get(this.STORAGE_KEY, (items) => {
      const data = items[this.STORAGE_KEY]
      Logger.debug('load data from storage')
      Logger.debug(data)

      callback(data)
    })
  }

  public save(data) {
    Logger.debug('save data to storage')
    Logger.debug(data)

    const save_data = {}
    save_data[this.STORAGE_KEY] = data
    chrome.storage.sync.set(save_data)
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
