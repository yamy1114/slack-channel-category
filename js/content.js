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
    logger.debug('hi!')
    // channel の div たちを保持している div
    channel_elements_div = target.getElementsByClassName('p-channel_sidebar__static_list')[0]
    add_prefix_to_channel(channel_elements_div)
    change_channel_order(channel_elements_div)
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
    logger.debug(channel_name)
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
