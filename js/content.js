// 動作確認用 poc

var logger = {
  debug: function(msg){
    console.log('DEBUG ' + new Date().toISOString() + ' ' + msg)
  }
}

$(function(){
  logger.debug('content.js run');

  var target = document.getElementsByClassName('p-client_container')[0];
  var monitor = new MutationObserver(function(){
    logger.debug('hi!')
    // channel の div たちを保持している div
    channel_elements_div = target.getElementsByClassName('p-channel_sidebar__static_list')[0];
    add_prefix_to_channel(channel_elements_div)
  });
  monitor.observe(target, {childList: true})
});

// channnel 名に prefix をつける
function add_prefix_to_channel(channel_elements_div) {
  channel_name_spans = channel_elements_div.getElementsByClassName('p-channel_sidebar__name');
  Array.from(channel_name_spans).forEach(span => {
    channel_name = span.innerHTML;
    if (channel_name.match(/bear|lego/)) {
      span.innerHTML = '[☆] ' + channel_name
    };
  })
}
