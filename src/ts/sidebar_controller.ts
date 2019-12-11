import Logger from './logger'
import CategorySection from './category_section'
import Category from './category'
import * as Constant from './constant'

export default class SidebarController {
  private storage
  private rootElement
  private categorySection
  private categories
  // Array<String, Element>
  private channels
  private originalSiderbarChildren
  private scrollArea
  private isWheelAssist
  private scrollOffset

  constructor(storage) {
    this.storage = storage
    this.rootElement = this.fetchRootElement()
    this.scrollArea= this.fetchScrollArea()
    this.originalSiderbarChildren = Array.from(this.rootElement.children)
    this.channels = this.composeChannels()
    this.setup()
  }

  private setup() {
    this.categorySection = new CategorySection(this.rootElement)
    this.registerAddCategoryButtonEvent(this.categorySection.getAddCategoryButton())
    this.createCategories()
  }

  private fetchRootElement() {
    return document.getElementsByClassName('p-channel_sidebar__static_list')[0]
  }

  private fetchScrollArea() {
    return document.getElementsByClassName('c-scrollbar__hider')[0]
  }

  private composeChannels() {
    const channels = []
    Array.from(this.rootElement.children).forEach((element: Element) => {
      if (element.getElementsByClassName('p-channel_sidebar__channel')[0] == null) {
        return
      }
      const channelName = element.getElementsByClassName('p-channel_sidebar__name')[0].textContent
      channels.push({
        name: channelName,
        element: element
      })
      this.registerForceStopSidebarScrollEvent(element, channelName)
    })
    return channels
  }

  private createCategories() {
    this.categories = {}
    this.storage.load((categoriesData) => {
      const sortedCategoryNames = Object.keys(categoriesData).sort()
      for(const categoryName of sortedCategoryNames) {
        const channels = this.channels.filter((channel) => {
         for(const channelName of categoriesData[categoryName]) {
           const channelRegex = new RegExp('^' + channelName.replace(/[\\^$.+?()[\]{}|]/g, '\\$&').replace(/\*/g, '.*') + '$')
            if (channel.name.match(channelRegex)) {
              return true
            }
          }
          return false
        })
        const category = new Category(this.rootElement, categoryName, channels, this.categorySection)
        this.registerRenameCategoryButtonEvent(category.getRenameCategoryButton(), categoryName)
        this.registerEditCategoryButtonEvent(category.getEditCategoryButton(), categoryName)
        this.registerDeleteCategoryButtonEvent(category.getDeleteCategoryButton(), categoryName)
        this.categories[categoryName] = category
      }
    })
  }

  private recomposeSidebar(categoriesData) {
    const categoryComponents = document.getElementsByClassName(Constant.CATEGORY_COMPONENT_CLASS)
    Array.from(categoryComponents).forEach(categoryComponent => {
      this.rootElement.removeChild(categoryComponent)
    })
    this.originalSiderbarChildren.forEach((element) => {
      this.rootElement.appendChild(element)
    })
    this.setup()
  }

  private registerAddCategoryButtonEvent(button) {
    button.onclick = () => {
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
      this.storage.load((categoriesData) => {
        if (categoriesData[newCategoryName] == undefined) {
          categoriesData[newCategoryName] = []
          this.storage.save(categoriesData)
          this.recomposeSidebar(categoriesData)
        } else {
          window.alert("'" + newCategoryName  + "' is already used!")
        }
      })
    }
  }

  private registerRenameCategoryButtonEvent(button, oldCategoryName) {
    button.onclick = () => {
      const newCategoryName = window.prompt(
        "Input new category name.\n" +
        "Category name should be composed by more than 1 following characters.\n" +
        "Available characters: [a-z][A-Z][0-9]_- ,./", oldCategoryName)
      if (newCategoryName == null) {
        return
      }
      if (newCategoryName == '' || !newCategoryName.match(/^[\w\-\ \/,\.]*$/)) {
        window.alert("Category name validation error!")
        return
      }
      this.storage.load((categoriesData) => {
        if (categoriesData[newCategoryName] == undefined) {
          categoriesData[newCategoryName] = categoriesData[oldCategoryName]
          delete categoriesData[oldCategoryName]
          this.storage.save(categoriesData)
          this.recomposeSidebar(categoriesData)
        } else {
          window.alert("'" + newCategoryName + "' is already used!")
        }
      })
    }
  }

  private registerEditCategoryButtonEvent(button, categoryName) {
    button.onclick = () => {
      this.storage.load((categoriesData) => {
        const currentChannels = categoriesData[categoryName]
        const newChannelNamesText = window.prompt(
          "Input channel names separated by '&'.\n" +
          "You can use '*' as wildcard.",
          currentChannels.join('&'),
        )
        if (newChannelNamesText == null) {
          return
        }
        let newChannelNames = newChannelNamesText.split('&')
        if (newChannelNames.filter(channelName => channelName.match(/^[\w\-\ ,\.\*]*$/)).length != newChannelNames.length) {
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
        categoriesData[categoryName] = newChannelNames
        this.storage.save(categoriesData)
        this.recomposeSidebar(categoriesData)
      })
    }
  }

  private registerDeleteCategoryButtonEvent(button, categoryName) {
    button.onclick = () => {
      if (!window.confirm('Do you delete category "' + categoryName + '"?')) {
        return
      }
      this.storage.load((categoriesData) => {
        delete categoriesData[categoryName]
        this.storage.save(categoriesData)
        this.recomposeSidebar(categoriesData)
      })
    }
  }

  private registerForceStopSidebarScrollEvent(element, channelName) {
    element.onmousedown = () => {
      Logger.debug('mousedown')
      if (element.getElementsByClassName('p-channel_sidebar__channel--selected')[0] != null) {
        Logger.debug('selected')
        return
      }

      console.log(this.scrollArea)
      this.scrollOffset = this.scrollArea.scrollTop
      this.scrollArea.classList.remove('c-scrollbar__hider')
      this.scrollArea.style.marginTop = '-' + this.scrollOffset + 'px'
      this.isWheelAssist = true

      this.scrollArea.onwheel = (event) => {
        this.scrollOffset += event.deltaY
        if (this.isWheelAssist) {
          this.scrollArea.scrollTop = this.scrollOffset
        }
      }

      this.scrollArea.onscroll = (event) => {
        event.stopPropagation()
      }

      const target = element.getElementsByClassName('p-channel_sidebar__channel')[0]
      const monitor = new MutationObserver(() => {
        setTimeout(() => {
          Logger.debug('scroll ok')
          this.scrollArea.classList.add('c-scrollbar__hider')
          this.scrollArea.style.marginTop = 0
          this.scrollArea.scrollTop = this.scrollOffset
          setTimeout(() => {
            Logger.debug('assist off')
            this.isWheelAssist = false
            this.scrollArea.onscroll = null
          }, 2000)
        }, 500)
        monitor.disconnect()
      })
      monitor.observe(target, { attributes: true, attributeFilter: ['class'] })
    }
  }
}
