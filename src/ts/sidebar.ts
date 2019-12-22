import Storage from './storage'
import CategorySection from './category_section'
import Category from './category'
import ScrollArea from './scroll_area'
import * as Constant from './constant'
import Logger from './logger'
import Base from './base'

export default class Sidebar extends Base {
  private that
  private categorySection
  private channels
  private scrollArea
  private isRecomposing

  constructor() {
    super()
    this.that = this
    this.element = document.getElementsByClassName('p-channel_sidebar__static_list')[0]
    this.scrollArea= new ScrollArea(this.that)
    this.registerChannelListObserver()
    this.setup()
  }

  private registerChannelListObserver() {
    const observer = new MutationObserver(() => {
      if (this.isRecomposing == false) {
        this.setup()
      }
    })
    observer.observe(this.element, { childList: true })
  }

  private async setup() {
    this.recompose(await Storage.load())
  }

  public recompose(categoriesData) {
    this.enableRecomposing()

    this.removeCategoryComponents()
    this.resetChannelsPosition()

    this.categorySection = new CategorySection(this.that)
    this.channels = this.composeChannels()
    this.createCategories(categoriesData)

    this.disableRecomposing()
  }

  private enableRecomposing() {
    this.isRecomposing = true
  }

  private disableRecomposing() {
    requestIdleCallback(() => {
      this.isRecomposing = false
    })
  }

  private removeCategoryComponents() {
    const categoryComponents = this.element.getElementsByClassName(Constant.CATEGORY_COMPONENT_CLASS)
    Array.from(categoryComponents).forEach(categoryComponent => {
      this.element.removeChild(categoryComponent)
    })
  }

  private resetChannelsPosition() {
    const starredChannels = this.getListItems('a[aria-label*=channel][data-qa-channel-sidebar-is-starred=true]')
    const starredSharedChannels = this.getListItems('a[aria-label*=shared][data-qa-channel-sidebar-is-starred=true]')
    const starredDirectMessages = this.getListItems('a[aria-label*=direct][data-qa-channel-sidebar-is-starred=true]')
    const notStarredChannels = this.getListItems('a[aria-label*=channel][data-qa-channel-sidebar-is-starred=false]')
    const notStarredSharedChannels = this.getListItems('a[aria-label*=shared][data-qa-channel-sidebar-is-starred=false]')
    const notStarredDirectMessages = this.getListItems('a[aria-label*=direct][data-qa-channel-sidebar-is-starred=false]')
    const draftChannelsAndMessages = this.getListItems('a[aria-label*=draft]')

    const starredInsertPosition = this.getSectionBottomBlank('div[data-qa=starred]')
    const channelsInsertPosition = this.getSectionBottomBlank('div[data-qa=channels]')
    const sharedInsertPosition = this.getSectionBottomBlank('div[data-qa=shared_channels]')
    const directMessagesInsertPosition = this.getSectionBottomBlank('div[data-qa=ims]')
    const draftInsertPosition = this.getSectionBottomBlank('div[data-qa=drafts]')

    this.bulkInsertBefore(starredChannels.concat(starredSharedChannels).concat(starredDirectMessages), starredInsertPosition)
    this.bulkInsertBefore(notStarredChannels, channelsInsertPosition)
    this.bulkInsertBefore(notStarredSharedChannels, sharedInsertPosition)
    this.bulkInsertBefore(notStarredDirectMessages, directMessagesInsertPosition)
    this.bulkInsertBefore(draftChannelsAndMessages, draftInsertPosition)
  }

  private composeChannels() {
    const channels = []
    Array.from(this.element.children).forEach((element: HTMLElement) => {
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
      element.onclick = this.scrollArea.forceStopScroll
    })
    return channels
  }

  private createCategories(categoriesData) {
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
      new Category(this.that, categoryName, channels, this.categorySection)
    }
  }

  private bulkInsertBefore(elements, insertPosition) {
    if (insertPosition == null) {
      return
    }
    Array.from(elements).forEach((element: Element) => {
      this.element.insertBefore(element, insertPosition)
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

  private getSectionBottomBlank(sectionQuery) {
    const sectionChild = this.element.querySelector(sectionQuery)
    if (sectionChild == null) {
      return null
    }
    const section = sectionChild.parentElement
    let findSectionFlag = false

    for(let i = 0; i < this.element.childElementCount; i++) {
      const element = this.element.children[i]
      if (findSectionFlag == true && element.getAttribute('role') == 'presentation') {
        return element
      }
      if (element == section) {
        findSectionFlag = true
      }
    }
  }
}
