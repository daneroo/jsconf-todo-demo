(function($){
  
  $('.item .edit').live('click', function(ev){
    ev.preventDefault();
    
    var item = $(this).parent('.item'),
        pos = item.position();
    $.get($(this).attr('href'), function(a){
      $('#wrap')
        .append(a)
        .children(':last')
          .width(item.width() + 1)
          .height(item.height() + 1)
          .css('left', pos.left)
          .css('top', pos.top);
    });
  });
  
  $('.item-edit .cancel').live('click', function(ev){
    ev.preventDefault();
    
    $(this).parents('.item-edit').remove();
  });
  
})(jQuery);