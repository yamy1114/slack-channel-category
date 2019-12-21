import Storage from './storage'
import SidebarController from './sidebar_controller'

import '../css/app.css'
import '../css/google_material_icon.css'

const main = () => {
  insertMaterialIconsLink()
  const monitor = new MutationObserver(startProcess)
  const monitoringTarget = document.getElementsByClassName('p-client_container')[0]
  monitor.observe(monitoringTarget, { childList: true })
}

const startProcess = () => {
  const workspaceName = fetchWorkspaceName()
  Storage.initialize(workspaceName)
  new SidebarController()
}

const fetchWorkspaceName = () => document.getElementsByClassName('p-classic_nav__team_header__team__name')[0].textContent

const insertMaterialIconsLink = () => {
  const element = document.createElement('link')
  element.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons')
  element.setAttribute('rel', 'stylesheet')
  document.head.appendChild(element)
}

main()
