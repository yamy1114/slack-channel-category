import Logger from './logger'
import CategorySection from './category_section'

export default class SidebarController {
  private storage
  private root_element
  private category_section

  constructor(storage) {
    this.storage = storage
    this.root_element = this.fetch_root_element()
    this.initialize()
    this.registerEvents()
  }

  private initialize() {
    this.category_section = new CategorySection(this.root_element)
  }

  private fetch_root_element() {
    return document.getElementsByClassName('p-channel_sidebar__static_list')[0]
  }

  private registerEvents() {
    this.registerAddCategoryButtonEvent()
  }

  private registerAddCategoryButtonEvent() {
    Logger.debug('registerAddCategoryButtonEvent')
    this.category_section.getAddCategoryButton().onclick = () => {
      Logger.debug('clicked registerAddCategoryButtonEvent')
      const new_category_name = window.prompt('Input new category name.', '')
      if (new_category_name == null) {
        return
      }
      if (new_category_name == '' || !new_category_name.match(/^[\w\-\ \/,\.]*$/)) {
        window.alert(`Category name should be composed by more than 1 following characters.
          Available characters: [a-z][A-Z][0-9]_- ,./`)
        return
      }
      this.storage.load((categories) => {
        if (categories[new_category_name] == undefined) {
          categories[new_category_name] = []
          this.storage.save(categories)
        } else {
          window.alert('Such category name is already used.')
        }
      })
    }
  }
}
