Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return JSON.parse(value || '{}');
}

trackBar = function(e) { // Handles clicks on the seekBar
  // Using $(e.currentTarget) to enable multiple seek bars
  $('.temp').remove()
  var $bar = $(e.currentTarget),
    offset = $bar.offset(),
    x = e.pageX - offset.left,
    w = $bar.width(),
    pos = 100 * x / w;
    addBar(pos, '', true);
}

addBar = function(pos, comment, isTemp){
  var tempClass = isTemp ? "temp" : "";
  $(".jp-play-bar1").append(
    "<div class='mark "+tempClass+"' style='left: "+pos+"%'>"
    +"<span>"+comment+"</span>"
    +"</div>");
  $('.commentForm').show();
}

$(function(){
  $('.jp-seek-bar1').click(function(e){ trackBar(e) });
  $('.commentForm__input').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){ // user pressed enter
      var pos = $('.temp').attr('style').replace('%', '').split(':')[1].trim('%');
      var comment = $('.commentForm__input').val();
      save(pos, comment);
      $('.commentForm').hide();
      $('.commentForm__input').val('');
      $('.temp').attr('class', 'mark'); // reset class
    }
});
  $(".jp-seek-bar1").mousemove(function(e){
     $('.marker').show();
     $('.timer').show();
     var offset = $(this).offset();
     var relX = e.pageX - offset.left;
     var pos = relX / $(this).width();
     var minutes = Math.floor(194 * pos / 60);
     var seconds = Math.floor(194 * pos % 60);
     $('.timer').text('0' + minutes + ':' + seconds)
     $('.timer').css({left: relX})
     $('.marker').css({left: relX})
  });
  $('.jp-seek-bar1').mouseout(function() {
    $('.marker').hide();
    $('.timer').hide();
  });
  render();
  $('.mark').mouseenter(function(e){
    var offset = $(this).offset();
    var relX = e.pageX - offset.left;
    $('.comment').css({left: relX})
    $('.comment').text(e.currentTarget.children[0].innerText);
    $('.comment').show();
  });
  $('.mark').mouseleave(function(e){
    $('.comment').hide();
  });
});

save = function(pos, cmt){
  var filename = 'edvard-grieg-peer-gynt1-morning-mood.mp3';
  var allMarks = localStorage.getObject('mycast.io-marks');
  var fileMarks = allMarks[filename] || [];
  var mark = {
    position: pos,
    time: 0,
    comment: cmt
  }
  fileMarks.push(mark);
  allMarks[filename] = fileMarks;
  localStorage.setObject('mycast.io-marks', allMarks);
}

render = function(){
  var filename = 'edvard-grieg-peer-gynt1-morning-mood.mp3';
  var allMarks = localStorage.getObject('mycast.io-marks');
  var fileMarks = allMarks[filename] || [];

  $.each(fileMarks, function(ind, mark){ addBar(mark.position, mark.comment, false); });
}
