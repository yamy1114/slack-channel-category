import Logger from './logger'
import CategorySection from './category_section'
import Category from './category'
import * as Constant from './constant'

export default class SidebarController {
  private storage
  private root_element
  private category_section
  private categories

  constructor(storage) {
    this.storage = storage
    this.root_element = this.fetch_root_element()
    this.initialize()
  }

  private initialize() {
    this.category_section = new CategorySection(this.root_element)
    this.registerAddCategoryButtonEvent(this.category_section.getAddCategoryButton())
    this.createCategories()
  }

  private fetch_root_element() {
    return document.getElementsByClassName('p-channel_sidebar__static_list')[0]
  }

  private createCategories() {
    this.categories = {}
    this.storage.load((categories_data) => {
      const sorted_category_names = Object.keys(categories_data).sort()
      for(const category_name of sorted_category_names) {
        const category = new Category(this.root_element, category_name, categories_data[category_name], this.category_section)
        this.registerRenameCategoryButtonEvent(category.getRenameCategoryButton(), category_name)
        this.registerEditCategoryButtonEvent(category.getEditCategoryButton(), category_name)
        this.registerDeleteCategoryButtonEvent(category.getDeleteCategoryButton(), category_name)
        this.categories[category_name] = category
      }
    })
  }

  private registerAddCategoryButtonEvent(button) {
    button.onclick = () => {
      const new_category_name = window.prompt('Input new category name.', '')
      if (new_category_name == null) {
        return
      }
      if (new_category_name == '' || !new_category_name.match(/^[\w\-\ \/,\.]*$/)) {
        window.alert(`Category name should be composed by more than 1 following characters.
          Available characters: [a-z][A-Z][0-9]_- ,./`)
        return
      }
      this.storage.load((categories_data) => {
        if (categories_data[new_category_name] == undefined) {
          categories_data[new_category_name] = []
          this.storage.save(categories_data)
          this.recompose_sidebar(categories_data)
        } else {
          window.alert('Such category name is already used.')
        }
      })
    }
  }

  private registerRenameCategoryButtonEvent(button, old_category_name) {
    button.onclick = () => {
      const new_category_name = window.prompt('Input new category name.', old_category_name)
      if (new_category_name == null) {
        return
      }
      if (new_category_name == '' || !new_category_name.match(/^[\w\-\ \/,\.]*$/)) {
        window.alert(`Category name should be composed by more than 1 following characters
          [a-z][A-Z][0-9]_- ,./`)
        return
      }
      this.storage.load((categories_data) => {
        if (categories_data[new_category_name] == undefined) {
          categories_data[new_category_name] = categories_data[old_category_name]
          delete categories_data[old_category_name]
          this.storage.save(categories_data)
          this.recompose_sidebar(categories_data)
        } else {
          window.alert('Such category name is already used.')
        }
      })
    }
  }

  private registerEditCategoryButtonEvent(button, category_name) {

  }

  private registerDeleteCategoryButtonEvent(button, category_name) {
    button.onclick = () => {
      if (!window.confirm('Do you delete category "' + category_name + '"')) {
        return
      }
      this.storage.load((categories_data) => {
        delete categories_data[category_name]
        this.storage.save(categories_data)
        this.recompose_sidebar(categories_data)
      })
    }
  }

  private recompose_sidebar(categories_data) {
    const category_components = document.getElementsByClassName(Constant.CATEGORY_COMPONENT_CLASS)
    Array.from(category_components).forEach(category_component => {
      this.root_element.removeChild(category_component)
    })
    this.initialize()
  }
}
