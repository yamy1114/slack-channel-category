import Storage from './storage'
import CategorySection from './category_section'
import Category from './category'
import * as Constant from './constant'

export default class SidebarController {
  private rootElement
  private categorySection
  private categories
  private channels
  private scrollArea
  private isWheelAssist
  private scrollOffset
  private isRecomposing

  constructor() {
    this.rootElement = this.fetchRootElement()
    this.scrollArea= this.fetchScrollArea()
    this.registerChannelListObserver()
    this.enableRecomposing()
    this.setup()
  }

  private async setup() {
    const categoriesData = await Storage.loadAsync()
    this.createCategoryComponents(categoriesData)
    this.disableRecomposing()
  }

  private createCategoryComponents(categoriesData) {
    this.categorySection = new CategorySection(this.rootElement)
    this.registerAddCategoryButtonEvent(this.categorySection.getAddCategoryButton())
    this.channels = this.composeChannels()
    this.createCategories(categoriesData)
  }

  private fetchRootElement() {
    return document.getElementsByClassName('p-channel_sidebar__static_list')[0]
  }

  private fetchScrollArea() {
    return document.getElementsByClassName('c-scrollbar__hider')[0]
  }

  private registerChannelListObserver() {
    const observer = new MutationObserver(() => {
      if (this.isRecomposing == false) {
        Storage.load((categoriesData) => {
          this.recomposeSidebar(categoriesData)
        })
      }
    })
    observer.observe(this.rootElement, { childList: true })
  }

  private composeChannels() {
    const channels = []
    Array.from(this.rootElement.children).forEach((element: Element) => {
      if (element.getElementsByClassName('p-channel_sidebar__channel')[0] == null) {
        return
      }
      element.classList.remove('channel_in_category')
      if (element.querySelector('a[aria-label*=draft]') != null) {
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

  private createCategories(categoriesData) {
    this.categories = {}
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
  }

  private recomposeSidebar(categoriesData) {
    this.isRecomposing = true

    const categoryComponents = document.getElementsByClassName(Constant.CATEGORY_COMPONENT_CLASS)
    Array.from(categoryComponents).forEach(categoryComponent => {
      this.rootElement.removeChild(categoryComponent)
    })

    this.resetChannelPosition()
    this.createCategoryComponents(categoriesData)

    requestIdleCallback(() => {
      this.isRecomposing = false
    })
  }

  private resetChannelPosition() {
    const starredChannels = this.getListItems('a[aria-label*=channel][data-qa-channel-sidebar-is-starred=true]')
    const starredSharedChannels = this.getListItems('a[aria-label*=shared][data-qa-channel-sidebar-is-starred=true]')
    const starredDirectMessages = this.getListItems('a[aria-label*=direct][data-qa-channel-sidebar-is-starred=true]')
    const notStarredChannels = this.getListItems('a[aria-label*=channel][data-qa-channel-sidebar-is-starred=false]')
    const notStarredSharedChannels = this.getListItems('a[aria-label*=shared][data-qa-channel-sidebar-is-starred=false]')
    const notStarredDirectMessages = this.getListItems('a[aria-label*=direct][data-qa-channel-sidebar-is-starred=false]')

    const starredSection = this.rootElement.querySelector('div[data-qa=starred]').parentElement
    const sharedChannelsSection = this.rootElement.querySelector('div[data-qa=shared_channels]').parentElement
    const channelsSection = this.rootElement.querySelector('div[data-qa=channels]').parentElement
    const directMessagesSection = this.rootElement.querySelector('div[data-qa=ims]').parentElement
    //    this.assignChannels(starredSection.nextSibling, starredChannels.concat(starredSharedChannels).concat(starredDirectMessages))
    //this.assignChannels(channelsSection.nextSibling, notStarredChannels)
    //this.assignChannels(sharedChannelsSection.nextSibling, notStarredSharedChannels)
    this.assignChannels(directMessagesSection.nextSibling, notStarredDirectMessages)

    if (this.rootElement.querySelector('div[data-qa=drafts]') != null) {
      const draftChannelsAndMessages = this.getListItems('a[aria-label*=draft]')
      const draftSection = this.rootElement.querySelector('div[data-qa=drafts]').parentElement
      this.assignChannels(draftSection.nextSibling, draftChannelsAndMessages)
    }
  }

  private assignChannels(insertPosition, channels) {
    Array.from(channels).forEach((channel: Element) => {
      this.rootElement.insertBefore(channel, insertPosition)
    })
  }

  private getListItems(query) {
    const elements = this.rootElement.querySelectorAll(query)
    const sortedElements = Array.from(elements).sort((a: Element, b: Element) => {
      return a.textContent < b.textContent ? -1 : 1
    })
    const parentElements = Array.from(sortedElements).map((element: Element) => {
      const parentElement = element.parentElement
      if (parentElement.getAttribute('role') == 'listitem') {
        return parentElement
      } else {
        return parentElement.parentElement
      }
    })
    return parentElements
  }

  private registerAddCategoryButtonEvent(button) {
    button.onclick = async () => {
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
        this.recomposeSidebar(categoriesData)
      } else {
        window.alert("'" + newCategoryName  + "' is already used!")
      }
    }
  }

  private registerRenameCategoryButtonEvent(button, oldCategoryName) {
    button.onclick = async () => {
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
      const categoriesData = await Storage.loadAsync()
      if (categoriesData[newCategoryName] == undefined) {
        categoriesData[newCategoryName] = categoriesData[oldCategoryName]
        delete categoriesData[oldCategoryName]
        Storage.save(categoriesData)
        this.recomposeSidebar(categoriesData)
      } else {
        window.alert("'" + newCategoryName + "' is already used!")
      }
    }
  }

  private registerEditCategoryButtonEvent(button, categoryName) {
    button.onclick = async () => {
      const categoriesData: any = await Storage.loadAsync()
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
      Storage.save(categoriesData)
      this.recomposeSidebar(categoriesData)
    }
  }

  private registerDeleteCategoryButtonEvent(button, categoryName) {
    button.onclick = async () => {
      if (!window.confirm('Do you delete category "' + categoryName + '"?')) {
        return
      }
      const categoriesData = await Storage.loadAsync()
      delete categoriesData[categoryName]
      Storage.save(categoriesData)
      this.recomposeSidebar(categoriesData)
    }
  }

  private registerForceStopSidebarScrollEvent(element, channelName) {
    element.onmousedown = () => {
      if (element.getElementsByClassName('p-channel_sidebar__channel--selected')[0] != null) {
        return
      }

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
          this.scrollArea.classList.add('c-scrollbar__hider')
          this.scrollArea.style.marginTop = 0
          this.scrollArea.scrollTop = this.scrollOffset
          setTimeout(() => {
            this.isWheelAssist = false
            this.scrollArea.onscroll = null
          }, 2000)
        }, 500)
        monitor.disconnect()
      })
      monitor.observe(target, { attributes: true, attributeFilter: ['class'] })
    }
  }

  private enableRecomposing() {
    this.isRecomposing = true
  }

  private disableRecomposing() {
    requestIdleCallback(() => {
      this.isRecomposing = false
    })
  }
}
