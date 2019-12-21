import Storage from './storage'
import * as Constant from './constant'

export default class CategorySection {
  private element
  private sidebar
  private bottomBlank

  constructor(sidebar) {
    this.sidebar = sidebar
    this.setup()
  }

  public getElement() {
    return this.element
  }

  public getBottomBlank() {
    return this.bottomBlank
  }

  private setup() {
    const insertPosition = this.fetchElementForInsertCategorySection().nextSibling
    this.sidebar.getElement().insertBefore(this.createCategorySection(), insertPosition)
    this.sidebar.getElement().insertBefore(this.createBottomBlank(), insertPosition)
  }

  private fetchElementForInsertCategorySection() {
    const elements = this.sidebar.getElement().children
    const length = this.sidebar.getElement().childElementCount

    let count = 0
    const targetCount = this.fetchTargetPresentationCount()

    for (let i = 0; i < length; i++) {
      if (elements[i].getAttribute('role') == 'presentation') {
        count++
      }
      if (count == targetCount) {
        return elements[i]
      }
    }
  }

  private fetchTargetPresentationCount() {
    if (this.sidebar.getElement().querySelector('div[data-qa=drafts]') != null) {
      return 3
    } else {
      return 2
    }
  }

  private createCategorySection() {
    const element = document.createElement('div')
    element.classList.add('category_section', Constant.CATEGORY_COMPONENT_CLASS)
    element.appendChild(this.createSectionHeading())
    this.element = element
    return element
  }

  private createSectionHeading() {
    const element = document.createElement('div')
    element.classList.add('p-channel_sidebar__section_heading')
    element.appendChild(this.createSectionHeadingLabel())
    element.appendChild(this.createSectionHeadingRight())
    return element
  }

  private createSectionHeadingLabel() {
    const element = document.createElement('div')
    element.classList.add('p-channel_sidebar__section_heading_label')
    element.textContent = 'Categories'
    return element
  }

  private createSectionHeadingRight() {
    const element = document.createElement('div')
    element.classList.add('p-channel_sidebar__section_heading_right')
    element.appendChild(this.createAddCategoryButton())
    return element
  }

  private createAddCategoryButton() {
    const element = document.createElement('button')
    element.classList.add('p-channel_sidebar__section_heading_plus', 'c-button-unstyled')
    element.onclick = this.addCategory
    return element
  }

  private async addCategory() {
    const newCategoryName = window.prompt(
      "Input new category name.\n" +
      "Category name should be composed by more than 1 following characters.\n" +
      "Available characters: [a-z][A-Z][0-9]_- ,./",
      '')
    if (newCategoryName == null) {
      return
    }
    if (newCategoryName == '' || !newCategoryName.match(/^[\w\-\ \/,\.]*$/)) {
      window.alert('Category name validation error!')
      return
    }
    const categoriesData = await Storage.loadAsync()
    if (categoriesData[newCategoryName] == undefined) {
      categoriesData[newCategoryName] = []
      Storage.save(categoriesData)
      this.sidebar.recompose(categoriesData)
    } else {
      window.alert("'" + newCategoryName  + "' is already used!")
    }
  }

  private createBottomBlank() {
    const element = document.createElement('div')
    element.classList.add(Constant.CATEGORY_COMPONENT_CLASS)
    element.classList.add('section_bottom_blank')
    this.bottomBlank = element
    return element
  }
}
