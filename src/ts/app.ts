import Logger from './logger'
import Storage from './storage'
import SidebarController from './sidebar_controller'

import '../css/app.css'
import '../css/google_material_icon.css'

const main = () => {
  const monitor = new MutationObserver(start_process)
  const monitoring_target = document.getElementsByClassName('p-client_container')[0]
  monitor.observe(monitoring_target, { childList: true })
}

const start_process = () => {
  Logger.debug('start process')

  const workspace_name = fetch_workspace_name()
  const storage = new Storage(workspace_name)
  new SidebarController(storage)
}

const fetch_workspace_name = () => document.getElementsByClassName('p-classic_nav__team_header__team__name')[0].textContent

main()
