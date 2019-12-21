import Storage from './storage'
import CategorySection from './category_section'
import Category from './category'
import * as Constant from './constant'

export default class Sidebar {
  private element
  private categorySection
  private categories
  private channels
  private scrollArea
  private isWheelAssist
  private scrollOffset
  private isRecomposing

  constructor() {
    this.element = document.getElementsByClassName('p-channel_sidebar__static_list')[0]
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
    this.categorySection = new CategorySection(self)
    this.channels = this.composeChannels()
    this.createCategories(categoriesData)
  }

  private getElement() {
    return this.element
  }

  private fetchScrollArea() {
    return document.getElementsByClassName('c-scrollbar__hider')[0]
  }

  private registerChannelListObserver() {
    const observer = new MutationObserver(() => {
      if (this.isRecomposing == false) {
        Storage.load((categoriesData) => {
          this.recompose(categoriesData)
        })
      }
    })
    observer.observe(this.element, { childList: true })
  }

  private composeChannels() {
    const channels = []
    Array.from(this.element.children).forEach((element: Element) => {
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
      const category = new Category(this.element, categoryName, channels, this.categorySection)
      this.categories[categoryName] = category
    }
  }

  private recompose(categoriesData) {
    this.isRecomposing = true

    const categoryComponents = document.getElementsByClassName(Constant.CATEGORY_COMPONENT_CLASS)
    Array.from(categoryComponents).forEach(categoryComponent => {
      this.element.removeChild(categoryComponent)
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

    const starredSection = this.element.querySelector('div[data-qa=starred]').parentElement
    const sharedChannelsSection = this.element.querySelector('div[data-qa=shared_channels]').parentElement
    const channelsSection = this.element.querySelector('div[data-qa=channels]').parentElement
    const directMessagesSection = this.element.querySelector('div[data-qa=ims]').parentElement
    //    this.assignChannels(starredSection.nextSibling, starredChannels.concat(starredSharedChannels).concat(starredDirectMessages))
    //this.assignChannels(channelsSection.nextSibling, notStarredChannels)
    //this.assignChannels(sharedChannelsSection.nextSibling, notStarredSharedChannels)
    this.assignChannels(directMessagesSection.nextSibling, notStarredDirectMessages)

    if (this.element.querySelector('div[data-qa=drafts]') != null) {
      const draftChannelsAndMessages = this.getListItems('a[aria-label*=draft]')
      const draftSection = this.element.querySelector('div[data-qa=drafts]').parentElement
      this.assignChannels(draftSection.nextSibling, draftChannelsAndMessages)
    }
  }

  private assignChannels(insertPosition, channels) {
    Array.from(channels).forEach((channel: Element) => {
      this.element.insertBefore(channel, insertPosition)
    })
  }

  private getListItems(query) {
    const elements = this.element.querySelectorAll(query)
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
