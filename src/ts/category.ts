import * as Constant from './constant'

export default class Category {
  private element
  private rootElement
  private categorySection
  private categoryName
  private channels
  private renameCategoryButton
  private editCategoryButton
  private deleteCategoryButton

  constructor(rootElement, categoryName, channels, categorySection) {
    this.rootElement = rootElement
    this.categoryName = categoryName
    this.channels = channels
    this.categorySection = categorySection
    this.setup()
  }

  public getElement() {
    return this.element
  }

  public getRenameCategoryButton() {
    return this.renameCategoryButton
  }

  public getEditCategoryButton() {
    return this.editCategoryButton
  }

  public getDeleteCategoryButton() {
    return this.deleteCategoryButton
  }

  private setup() {
    this.categorySection.getElement().appendChild(this.createCategory())
  }

  private createCategory() {
    const element = document.createElement('div')
    element.appendChild(this.createCategoryHeader())
    if (this.channels.length != 0) {
      element.appendChild(this.createCategoryChannels())
    }
    return element
  }

  private createCategoryHeader() {
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
    element.textContent = this.categoryName
    return element
  }

  private createRenameCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'rename_category_button')
    element.textContent = 'edit'
    this.renameCategoryButton = element
    return element
  }

  private createEditCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'edit_category_button')
    element.textContent = 'playlist_add'
    this.editCategoryButton = element
    return element
  }

  private createDeleteCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'delete_category_button')
    element.textContent = 'delete_outline'
    this.deleteCategoryButton = element
    return element
  }

  private createCategoryChannels() {
    const element = document.createElement('div')
    element.classList.add('category_channels')
    element.appendChild(this.createStepShadow())
    this.channels.forEach((channel) => {
      element.appendChild(channel.element)
    })
    element.appendChild(this.createLightRelection())
    return element
  }

  private createStepShadow() {
    const element = document.createElement('div')
    element.classList.add('step_shadow')
    return element
  }

  private createLightRelection() {
    const element = document.createElement('div')
    element.classList.add('light_reflection')
    return element
  }
}
