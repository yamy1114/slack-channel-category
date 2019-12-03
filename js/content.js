// 動作確認用 poc

var logger = {
  debug: function(msg){
    console.log('DEBUG ' + new Date().toISOString() + ' ' + msg)
  }
}

var original

$(function(){
  logger.debug('content.js run')

  var target = document.getElementsByClassName('p-client_container')[0]
  var monitor = new MutationObserver(function(){
    // channel の div たちを保持している div
    let channel_elements_div = target.getElementsByClassName('p-channel_sidebar__static_list')[0]
    original = Array.from(channel_elements_div.children)
    register_storage()
    add_category_section(channel_elements_div)
    add_category(channel_elements_div)
    monitor.disconnect()
  })
  monitor.observe(target, {childList: true})
})

function register_storage() {
  let categories = []
  item = chrome.storage.sync.get(['categories'], function(item){
    if (item.categories == null) {
      chrome.storage.sync.set({categories: categories})
    }
  })
}

// category section を追加する
function add_category_section(channel_elements_div) {
  starred = null
  // 2個目の presentation の後ろに配置してやる
  let found_presentation_count = 0
  Array.from(channel_elements_div.children).forEach(div => {
    if (div.getAttribute('role') == 'presentation') {
      found_presentation_count++
      if (found_presentation_count == 2) {
        starred = div
      }
    }
  })
  logger.debug(starred)

  presentation = document.createElement('div')
  presentation.setAttribute('role', 'presentation')
  presentation.style.height = '10px'
  presentation.classList.add('category_compose_item')
  channel_elements_div.insertBefore(presentation, starred.nextSibling)
  
  // 他と合わせていい感じに太字にしてくれる
  section_heading_label = document.createElement('div')
  section_heading_label.classList.add('p-channel_sidebar__section_heading_label')
  section_heading_label.textContent = 'Categories'

  // + ボタン
  plus_button = document.createElement('button')
  plus_button.classList.add('p-channel_sidebar__section_heading_plus')
  plus_button.classList.add('c-button-unstyled')
  plus_button.onclick = function(){
    category_plus_clicked()
  }
  section_heading_right = document.createElement('div')
  section_heading_right.classList.add('p-channel_sidebar__section_heading_right')
  section_heading_right.appendChild(plus_button)

  section_heading = document.createElement('div')
  section_heading.classList.add('p-channel_sidebar__section_heading')
  section_heading.appendChild(section_heading_label)
  section_heading.appendChild(section_heading_right)
  
  let categories = document.createElement('div')
  categories.setAttribute('role', 'listitem')
  categories.classList.add('categories')
  categories.classList.add('category_compose_item')
  categories.appendChild(section_heading)

  channel_elements_div.insertBefore(categories, starred.nextSibling) 
}

function sidebar_recompose() {
  channel_elements_div = document.getElementsByClassName('p-channel_sidebar__static_list')[0]

  // category 系のものを全削除
  category_compose_item = document.getElementsByClassName('category_compose_item')
  Array.from(category_compose_item).forEach(element => {
    channel_elements_div.removeChild(element)
  })

  // sidebar 再構築
  original.forEach(element => {
    channel_elements_div.appendChild(element)
  })
  add_category_section(channel_elements_div)
  add_category(channel_elements_div)
}
 
// Categories の + ボタンが押された時に発火
function category_plus_clicked() {
  new_category_name = window.prompt('input new category name', '')
  if (new_category_name == null) {
    return
  }
  if (!new_category_name.match(/^[\w\-\ \/,\.]*$/)) {
    window.alert('category name should be composed by more than 1 characters of "a-Z" "0-9" "_" "-" " " "," "." "/"')
    return
  }
  chrome.storage.sync.get(['categories'], function(item){
    let categories = item.categories
  
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].name == new_category_name) {
        window.alert('already used')
        return
      }
    }
    categories.push({ name: new_category_name, channels: [] })
    chrome.storage.sync.set({ categories: categories }, function() {
      // location.reload()
      sidebar_recompose()
   })
 })
}

// category を追加する
function add_category(channel_elements_div) {
  chrome.storage.sync.get(['categories'], function(item){
    categories = item.categories
    categories.sort(function(a, b) {
      return a.name > b.name ? -1 : 1
    })
    add_category_in_callback(channel_elements_div, categories)
  })
}

function add_category_in_callback(channel_elements_div, categories) {
  categories.forEach(category => {
    category_name = category.name  

    // google material icon 使うために header に link 仕込む
    icon_font_link = document.createElement('link')
    icon_font_link.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons')
    icon_font_link.setAttribute('rel', 'stylesheet')
    document.head.appendChild(icon_font_link)
  
    category_name_span = document.createElement('span')
    category_name_span.textContent = category_name
    category_name_span.classList.add('p-channel_sidebar__name')
  
    category_icon_i = document.createElement('i')
    category_icon_i.classList.add('material-icons')
    category_icon_i.textContent = 'category'

    category_close_button = document.createElement('i')
    category_close_button.classList.add('material-icons')
    category_close_button.classList.add('category_close_button')
    category_close_button.textContent = 'delete_outline'
    category_close_button.onclick = function(e){
      close_category(categories, this.parentElement.children[1].textContent)
    }
    
    category_edit_button = document.createElement('i')
    category_edit_button.classList.add('material-icons')
    category_edit_button.classList.add('category_edit_button')
    category_edit_button.textContent = 'playlist_add'
    category_edit_button.onclick = function(e){
      new_channel_in_category(categories, this.parentElement.children[1].textContent)
    } 

    category_div = document.createElement('div')
    // これつけたら他と合わせていい感じの位置に表示してくれる
    category_div.classList.add('p-channel_sidebar__link')
    category_div.classList.add('category')
    category_div.appendChild(category_icon_i)
    category_div.appendChild(category_name_span)
    category_div.appendChild(category_edit_button)
    category_div.appendChild(category_close_button)
  
    listitem_div = document.createElement('div')
    listitem_div.setAttribute('role', 'listitem')
    listitem_div.classList.add('category_compose_item')
    listitem_div.appendChild(category_div)
  
    parent_channel = document.getElementsByClassName('categories')[0]
  
    channel_elements_div.insertBefore(listitem_div, parent_channel.nextSibling)
  })

  add_channel_to_category(channel_elements_div, categories)
}

// category_close
function close_category(categories, delete_category_name) {
  if (!window.confirm('do you delete category "' + delete_category_name + '"')) {
    return
  }
  updated_categories = categories.filter(category => category.name != delete_category_name)
  chrome.storage.sync.set({ categories: updated_categories }, function(){
    // location.reload()
    sidebar_recompose()
  })
}

// add_category_channel
function new_channel_in_category(categories, target_category_name) {
  target_category = categories.filter(category => category.name == target_category_name)[0]
  logger.debug(target_category.name)
  let result =  window.prompt(
    'input channels separeted by "&" in category "' + target_category_name  + '"',
    target_category.channels.join('&')
  )
  save_channels = result.split('&')
  if (result == null) {
    return
  }
  if (save_channels.filter(n => n.match(/^[\w\-\ ,\.\*]*$/)).length != save_channels.length) {
    window.alert(
      "channel names validation failed\n" +
      'valid example) hoge&foo-channel'
    )
    return
  }
  // これから登録する channel の重複削除
  save_channels = save_channels.filter(function(x, i, self) {
    return self.indexOf(x) == i
  })
  // 既に存在している category からの重複削除
  updated_categories = categories.filter(category => category.name != target_category_name)
  updated_categories.forEach(category => {
    save_channels.forEach(channel => {
      let i = category.channels.indexOf(channel)
      if (i != -1) {
        category.channels.splice(i, 1)
      }
    })
  })
  updated_categories.push({
    name: target_category_name,
    channels: save_channels
  })
  chrome.storage.sync.set({ categories: updated_categories }, function(){
    // location.reload()
    sidebar_recompose()
  })
}

function channel_match(channels, name) {
  if (channels.includes(name)) {
    return true
  }
  regexp_channels = channels.filter(channel => channel.includes('*'))
  for (i = 0; i < regexp_channels.length; i++) {
    regexp_channel = new RegExp('^' + regexp_channels[i].replace(/[\\^$.+?()[\]{}|]/g, '\\$&').replace(/\*/g, '.*') + '$')
    if (name.match(regexp_channel)) {
      return true
    }
  }
  return false
}

// category 配下に channel を追加
function add_channel_to_category(channel_elements_div, categories) {
  // ここはリファクタリング時に category の作成と同時に channel 追加をしても良いかも
  categories.forEach(category_data => {
    let child_channel_names = category_data.channels
    let category_name = category_data.name
  
    let child_channels = []
    let category = null
    Array.from(channel_elements_div.children).forEach(div => {
      name_spans = div.getElementsByClassName('p-channel_sidebar__name')
      if (name_spans.length == 1) {
        name = name_spans[0].textContent
        if (name == category_name) {
          category = div
        } else if (channel_match(child_channel_names, name)) {
          child_channels.push(div)
        }
      }
    })
  
    let category_channels_div = document.createElement('div')
    category_channels_div.classList.add('category_channels')
    let sidebar = document.getElementsByClassName('p-channel_sidebar')[0]
    category.appendChild(category_channels_div)

    if (child_channels.length != 0) {
      step_shadow = document.createElement('div')
      step_shadow.classList.add('step_shadow')
      category_channels_div.appendChild(step_shadow)
   
      child_channels.forEach(category_channel => {
        category_channels_div.appendChild(category_channel)
  //    category_channel.children[0].style.paddingLeft = '250px'
      // onclick だと遅い、slack の処理との優先順位が前後する可能性があるため、押下の瞬間を取られる
        category_channel.onmousedown = function(){
          category_channel_clicked(category_channel)
        }
      })

      light_reflection = document.createElement('div')
      light_reflection.classList.add('light_reflection')
      category_channels_div.appendChild(light_reflection)
    }
  })
}

// click 時に発火するイベント、css の再適用とか scroll 位置の調整とかを無理やり対処
category_channel_clicked = function (category_channel) {
  scrollable_classname = 'c-scrollbar__hider'
  let scroll_area = document.getElementsByClassName(scrollable_classname)[0]
  let scroll_offset = scroll_area.scrollTop

  // このスーパー強引ハックよ、スクロール対象の class を削除して slack からの制御を無効化
  // クラス外したら scrollTop が 0 になってしまうので、marginTop をいじって表示位置が動いていないように見せる
  // ちょっと処理遅延するけど、まあ通常の仕様にとっては許容範囲でしょ
  scroll_area.classList.remove(scrollable_classname)
  scroll_area.style.marginTop = '-' + scroll_offset + 'px' 
 
  let target = category_channel.getElementsByClassName('p-channel_sidebar__channel')[0]
  let monitor = new MutationObserver(function(){
    setTimeout(function(){
      scroll_area.classList.add(scrollable_classname)
      scroll_area.style.marginTop = '0px'
      scroll_area.scrollTop = scroll_offset
    }, 100)
    monitor.disconnect()
  }) 
  monitor.observe(target, { attributes: true, attributeFilter: ['class']})
}
