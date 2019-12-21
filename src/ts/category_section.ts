import * as Constant from './constant'

export default class CategorySection {
  private element
  private rootElement
  private addCategoryButton
  private bottomBlank

  constructor(rootElement) {
    this.rootElement = rootElement
    this.setup()
  }

  public getElement() {
    return this.element
  }

  public getAddCategoryButton() {
    return this.addCategoryButton
  }

  public getBottomBlank() {
    return this.bottomBlank
  }

  private setup() {
    const insertPosition = this.fetchElementForInsertCategorySection().nextSibling
    this.rootElement.insertBefore(this.createCategorySection(), insertPosition)
    this.rootElement.insertBefore(this.createBottomBlank(), insertPosition)
  }

  private fetchElementForInsertCategorySection() {
    const elements = this.rootElement.children
    const length = this.rootElement.childElementCount

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
    if (this.rootElement.querySelector('div[data-qa=drafts]') != null) {
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
    this.addCategoryButton = element
    return element
  }

  private createBottomBlank() {
    const element = document.createElement('div')
    element.classList.add(Constant.CATEGORY_COMPONENT_CLASS)
    element.classList.add('section_bottom_blank')
    this.bottomBlank = element
    return element
  }
}
