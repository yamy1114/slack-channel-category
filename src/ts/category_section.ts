import Logger from './logger'
import * as Constant from './constant'

export default class CategorySection {
  private element
  private root_element
  private add_category_button

  constructor(root_element) {
    this.root_element = root_element
    this.setup()
  }

  public getElement() {
    return this.element
  }

  public getAddCategoryButton() {
    return this.add_category_button
  }

  private setup() {
    const before_element = this.fetchSecondPresentation()

    const blank = this.createBlank()
    this.root_element.insertBefore(blank, before_element.nextSibling)

    const category_section = this.createCategorySection()
    this.root_element.insertBefore(category_section, before_element.nextSibling)
  }

  private fetchSecondPresentation() {
    const elements = this.root_element.children
    const length = this.root_element.childElementCount
    let count = 0
    for (let i = 0; i < length; i++) {
      if (elements[i].getAttribute('role') == 'presentation') {
        count++
      }
      if (count == 2) {
        return elements[i]
      }
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
    this.add_category_button = element
    return element
  }

  private createBlank() {
    const element = document.createElement('div')
    element.classList.add('after_category_blank', Constant.CATEGORY_COMPONENT_CLASS)
    return element
  }
}
