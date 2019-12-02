// 動作確認用 poc

var logger = {
  debug: function(msg){
    console.log('DEBUG ' + new Date().toISOString() + ' ' + msg)
  }
}

$(function(){
  logger.debug('content.js run')

  var target = document.getElementsByClassName('p-client_container')[0]
  var monitor = new MutationObserver(function(){
    // channel の div たちを保持している div
    channel_elements_div = target.getElementsByClassName('p-channel_sidebar__static_list')[0]
    add_prefix_to_channel(channel_elements_div)
    change_channel_order(channel_elements_div)
    add_category_section(channel_elements_div)
    register_storage()
    add_category(channel_elements_div)
    add_channel_to_category(channel_elements_div)
  })
  monitor.observe(target, {childList: true})
})

// channnel 名に prefix をつける
function add_prefix_to_channel(channel_elements_div) {
  channel_name_spans = channel_elements_div.getElementsByClassName('p-channel_sidebar__name')
  Array.from(channel_name_spans).forEach(span => {
    channel_name = span.textContent
    if (channel_name.match(/ecl/)) {
      span.textContent = '[ECL] ' + channel_name
    }
  })
}

// channel の表示順を制御する
function change_channel_order(channel_elements_div) {
  child_channel_name_regex = /lego/
  parent_channel_name = 'bear-ope-jp'

  child_channels = []
  parent_channel = null
  Array.from(channel_elements_div.children).forEach(channel_div => {
    channel_name_spans = channel_div.getElementsByClassName('p-channel_sidebar__name')
    if (channel_name_spans.length != 1) {
      return
    }
    channel_name = channel_name_spans[0].textContent
    if (channel_name == parent_channel_name) {
      parent_channel = channel_div
    } else if (channel_name.match(child_channel_name_regex)) {
      child_channels.push(channel_div)
    }
  })

  child_channels.forEach(child_channel => {
    channel_elements_div.insertBefore(child_channel, parent_channel.nextSibling)
    parent_channel = child_channel
  })
}

function register_storage() {
  categories = [
    {
      name: 'lab3ec',
      channels: ['bear-jp-lab3ec-ope', 'region-lab3ec-jp']
    },
    {
      name: 'yamy-hoge',
      channels: ['h29']
    }
  ] 
  chrome.storage.sync.set({categories: categories})
  chrome.storage.sync.get(['categories'], function(item){
    logger.debug(item.categories[0])
    logger.debug(item.categories[1])
  })
}

// category section を追加する
function add_category_section(channel_elements_div) {
  starred = null
  Array.from(channel_elements_div.children).forEach(div => {
    section_name_spans = div.getElementsByClassName('p-channel_sidebar__section_heading_label')
    if (section_name_spans.length != 1) {
      return
    }
    section_name = section_name_spans[0].textContent
    if (section_name == ' Starred') {
      starred = div
    }
  })

  section_heading = document.createElement('div')
  section_heading.classList.add('p-channel_sidebar__section_heading')
  // 他と合わせていい感じに太字にしてくれる
  section_heading.classList.add('p-channel_sidebar__section_heading_label')
  section_heading.textContent = 'Categories'

  categories = document.createElement('div')
  categories.setAttribute('role', 'listitem')
  categories.classList.add('categories')
  categories.appendChild(section_heading)

  channel_elements_div.insertBefore(categories, starred) 
  
  presentation = document.createElement('div')
  presentation.setAttribute('role', 'presentation')
  presentation.style.height = '10px'

  channel_elements_div.insertBefore(presentation, starred)
}

// category を追加する
function add_category(channel_elements_div) {
  chrome.storage.sync.get(['categories'], function(item){
    categories = item.categories
  })

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
  
    category_div = document.createElement('div')
    // これつけたら他と合わせていい感じの位置に表示してくれる
    category_div.classList.add('p-channel_sidebar__link')
    category_div.classList.add('category')
    category_div.appendChild(category_icon_i)
    category_div.appendChild(category_name_span)
  
    listitem_div = document.createElement('div')
    listitem_div.setAttribute('role', 'listitem')
    listitem_div.setAttribute('id', 'listitem_category_' + category_name)
    listitem_div.appendChild(category_div)
  
    parent_channel = document.getElementsByClassName('categories')[0]
  
    channel_elements_div.insertBefore(listitem_div, parent_channel.nextSibling)
  })
}

// category 配下に channel を追加
function add_channel_to_category(channel_elements_div) {
  chrome.storage.sync.get(['categories'], function(item){
    categories = item.categories
  })

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
        } else if (child_channel_names.includes(name)) {
          child_channels.push(div)
        }
      }
    })
  
 
    let category_channels_div = document.createElement('div')
    category_channels_div.classList.add('category_channels')
    let sidebar = document.getElementsByClassName('p-channel_sidebar')[0]
    category.appendChild(category_channels_div)

    shadow_step = document.createElement('div')
    shadow_step.classList.add('shadow_step')
    category_channels_div.appendChild(shadow_step)
   
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
