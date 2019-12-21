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
    this.rootElement.insertBefore(this.createCategory(), this.categorySection.getBottomBlank())
    if (this.channels.length != 0) {
      this.rellocateCategoryChannels()
    }
  }

  private createCategory() {
    const element = document.createElement('div')
    element.classList.add(Constant.CATEGORY_COMPONENT_CLASS)
    element.appendChild(this.createCategoryHeader())
    this.element = element
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

  private rellocateCategoryChannels() {
    const insertPosition = this.element.nextSibling
    this.rootElement.insertBefore(this.createStepShadow(), insertPosition)
    this.channels.forEach((channel) => {
      channel.element.classList.add('channel_in_category')
      this.rootElement.insertBefore(channel.element, insertPosition)
    })
    this.rootElement.insertBefore(this.createLightRelection(), insertPosition)
 }

  private createStepShadow() {
    const element = document.createElement('div')
    element.classList.add(Constant.CATEGORY_COMPONENT_CLASS)
    element.classList.add('step_shadow')
    return element
  }

  private createLightRelection() {
    const element = document.createElement('div')
    element.classList.add(Constant.CATEGORY_COMPONENT_CLASS)
    element.classList.add('light_reflection')
    return element
  }
}
