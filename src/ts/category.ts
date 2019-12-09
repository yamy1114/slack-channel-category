import Logger from './logger'
import * as Constant from './constant'

export default class Category {
  private element
  private root_element
  private category_section
  private category_name
  private channels
  private rename_category_button
  private edit_category_button
  private delete_category_button

  constructor(root_element, category_name, channels, category_section) {
    this.root_element = root_element
    this.category_name = category_name
    this.channels = channels
    this.category_section = category_section
    this.setup()
  }

  public getElement() {
    return this.element
  }

  public getRenameCategoryButton() {
    return this.rename_category_button
  }

  public getEditCategoryButton() {
    return this.edit_category_button
  }

  public getDeleteCategoryButton() {
    return this.delete_category_button
  }

  private setup() {
    this.category_section.getElement().appendChild(this.createCategory())
  }

  private createCategory() {
    const element = document.createElement('div')
    element.classList.add('p-channel_sidebar__link')
    element.appendChild(this.createCategoryIcon())
    element.appendChild(this.createCategoryNameLabel())
    element.appendChild(this.createRenameCategoryButton())
    element.appendChild(this.createEditCategoryButton())
    element.appendChild(this.createDeleteCategoryButton())
    this.element = element
    return element
  }

  private createCategoryIcon() {
    const element = document.createElement('i')
    element.classList.add('material-icons')
    element.textContent = 'folder_open'
    return element
  }

  private createCategoryNameLabel() {
    const element = document.createElement('span')
    element.classList.add('p-channel_sidebar__name')
    element.textContent = this.category_name
    return element
  }

  private createRenameCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'rename_category_button')
    element.textContent = 'edit'
    this.rename_category_button = element
    return element
  }

  private createEditCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'edit_category_button')
    element.textContent = 'playlist_add'
    this.edit_category_button = element
    return element
  }

  private createDeleteCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'delete_category_button')
    element.textContent = 'delete_outline'
    this.delete_category_button = element
    return element
  }
}
