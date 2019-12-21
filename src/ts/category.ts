import Storage from './storage'
import * as Constant from './constant'
import Base from './base'

export default class Category extends Base {
  private sidebar
  private categorySection
  private categoryName
  private channels

  constructor(sidebar, categoryName, channels, categorySection) {
    super()
    this.sidebar = sidebar
    this.categoryName = categoryName
    this.channels = channels
    this.categorySection = categorySection
    this.setup()
  }

  private setup() {
    this.sidebar.getElement().insertBefore(this.createCategory(), this.categorySection.getBottomBlank())
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
    element.onclick = async () => {
      const newCategoryName = window.prompt(
        "Input new category name.\n" +
        "Category name should be composed by more than 1 following characters.\n" +
        "Available characters: [a-z][A-Z][0-9]_- ,./", this.categoryName)
      if (newCategoryName == null) {
        return
      }
      if (newCategoryName == '' || !newCategoryName.match(/^[\w\-\ \/,\.]*$/)) {
        window.alert("Category name validation error!")
        return
      }
      const categoriesData = await Storage.loadAsync()
      if (categoriesData[newCategoryName] == undefined) {
        categoriesData[newCategoryName] = categoriesData[this.categoryName]
        delete categoriesData[this.categoryName]
        Storage.save(categoriesData)
        this.sidebar.recompose(categoriesData)
      } else {
        window.alert("'" + newCategoryName + "' is already used!")
      }
    }
    return element
  }

  private createEditCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'edit_category_button')
    element.textContent = 'playlist_add'
    element.onclick = async () => {
      const categoriesData: any = await Storage.loadAsync()
      const currentChannels = categoriesData[this.categoryName]
      const newChannelNamesText = window.prompt(
        "Input channel names separated by '&'.\n" +
        "You can use '*' as wildcard.",
        currentChannels.join('&'),
      )
      if (newChannelNamesText == null) {
        return
      }
      let newChannelNames = newChannelNamesText.split('&')
      if (newChannelNames.filter(channelName => channelName.match(/^[\w\-\ ,\.\*]*$/)).length     != newChannelNames.length) {
        window.alert('Parsing channel names is failed!')
      }
      // delete duplicate channel name in newChannelNames
      newChannelNames = newChannelNames.filter((channelName, index, self) => {
        return self.indexOf(channelName) == index
      })
      // delete duplicate channel name in other categories
      newChannelNames.forEach((channelName: String) => {
        for(const categoryName in categoriesData) {
          const channels = categoriesData[categoryName]
          const index = channels.indexOf(channelName)
          if (index != -1) {
            categoriesData[categoryName] = channels.splice(index, 1)
          }
        }
      })
      categoriesData[this.categoryName] = newChannelNames
      Storage.save(categoriesData)
      this.sidebar.recompose(categoriesData)
    }
    return element
  }

  private createDeleteCategoryButton() {
    const element = document.createElement('i')
    element.classList.add('material-icons', 'delete_category_button')
    element.textContent = 'delete_outline'
    element.onclick = async () => {
      if (!window.confirm('Do you delete category "' + this.categoryName + '"?')) {
        return
      }
      const categoriesData = await Storage.loadAsync()
      delete categoriesData[this.categoryName]
      Storage.save(categoriesData)
      this.sidebar.recompose(categoriesData)
    }
    return element
  }

  private rellocateCategoryChannels() {
    const insertPosition = this.element.nextSibling
    this.sidebar.getElement().insertBefore(this.createStepShadow(), insertPosition)
    this.channels.forEach((channel) => {
      channel.element.classList.add('channel_in_category')
      this.sidebar.getElement().insertBefore(channel.element, insertPosition)
    })
    this.sidebar.getElement().insertBefore(this.createLightRelection(), insertPosition)
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
