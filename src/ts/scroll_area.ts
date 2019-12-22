import Base from './base'

export default class ScrollArea extends Base {
  private sidebar
  private isWheelAssist
  private scrollOffset

  constructor(sidebar) {
    super()
    this.sidebar = sidebar
    this.element = document.getElementsByClassName('c-scrollbar__hider')[0]
  }

  public forceStopScroll = (event) => {
    if (event.currentTarget.getElementsByClassName('p-channel_sidebar__channel--selected')[0] != null) {
      return
    }

    this.scrollOffset = this.element.scrollTop
    this.element.classList.remove('c-scrollbar__hider')
    this.element.style.marginTop = '-' + this.scrollOffset + 'px'
    this.isWheelAssist = true

    this.element.onwheel = (event) => {
      this.scrollOffset += event.deltaY
      if (this.isWheelAssist) {
        this.element.scrollTop = this.scrollOffset
      }
    }

    this.element.onscroll = (event) => {
      event.stopPropagation()
    }

    const target = event.currentTarget.getElementsByClassName('p-channel_sidebar__channel')[0]
    const monitor = new MutationObserver(() => {
      setTimeout(() => {
        this.element.classList.add('c-scrollbar__hider')
        this.element.style.marginTop = 0
        this.element.scrollTop = this.scrollOffset
        setTimeout(() => {
          this.isWheelAssist = false
          this.element.onscroll = null
        }, 2000)
      }, 500)
      monitor.disconnect()
    })
    monitor.observe(target, { attributes: true, attributeFilter: ['class'] })
  }
}
