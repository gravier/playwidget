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
  var posPercent = getPositionPercent(e.currentTarget, e);
  addBar(posPercent, '', true);
}

getPosition = function(target, e) { // Handles clicks on the seekBar
  var $bar = $(target),
    offset = $bar.offset(),
    x = e.pageX - offset.left,
    w = $bar.width(),
    pos = x / w;
  return pos;
}

getPositionPercent = function(target, e) { // Handles clicks on the seekBar
  return getPosition(target, e) * 100;
}

addBar = function(pos, comment, isTemp){
  var tempClass = isTemp ? "temp" : "";
  $(".jp-play-bar1").append(
    "<div class='mark "+tempClass+"' style='left: "+pos+"%'>"
    +"<span>"+comment+"</span>"
    +"</div>");

    if(isTemp) {
      $('.commentForm').show();
    }
}

getDuration = function(){
  var data = $('#jquery_jplayer_1').data('jPlayer');
  return data.htmlElement.media.duration;
}

getFilename = function(){
  var data = $('#jquery_jplayer_1').data('jPlayer');
  var src = data.htmlElement.media.attributes.src.value;
  return src.substr(src.lastIndexOf('/') + 1);
}

// init events
$(function(){
  var media = {
		title: "Podcast",
		mp3: "http://www.mfiles.co.uk/mp3-downloads/edvard-grieg-peer-gynt1-morning-mood.mp3",
	}
	$("#jquery_jplayer_1").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", media);
        render();
        // event attached after render
        $('.mark').mouseenter(showEvent);
		},
		swfPath: "../dist/jplayer",
		supplied: "mp3",
		wmode: "window",
		useStateClassSkin: true,
		autoBlur: false,
		smoothPlayBar: true,
		keyEnabled: true,
		remainingDuration: true,
		toggleDuration: true
	});

  $('.jp-seek-bar1').click(function(e){ trackBar(e) });
  $('.mark-play').click(function(e){
    var pos = $('.mark-selected').attr('style').replace('%', '').split(':')[1].trim('%');
    var time = getDuration() * pos / 100;
    $('#jquery_jplayer_1').jPlayer("play", time)
    $('.comment').hide();
    $('.mark-play').hide();
    e.stopPropagation();
  });
  $('.comment').click(function(e){
    $('.comment').hide();
    $('.mark-play').hide();
    e.stopPropagation();
  });
  $('.commentForm__input').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){ // user pressed enter
      var pos = $('.temp').attr('style').replace('%', '').split(':')[1].trim('%');
      var comment = $('.commentForm__input').val();
      save(pos, comment);
      $('.commentForm').hide();
      $('.commentForm__input').val('');
      $('.temp').mouseenter(showEvent);
      $('.temp').find('span').text(comment);
      $('.temp').attr('class', 'mark'); // reset class
    }
});
  $(".jp-seek-bar1").mousemove(function(e){
     $('.marker').show();
     $('.timer').show();
     var offset = $(this).offset();
     var relX = e.pageX - offset.left;
     var pos = relX / $(this).width();
     var duration = getDuration();
     // TODO add missing zero when minute is single digit.
     // TODO add hour support
     var minutes = Math.floor(duration * pos / 60);
     var seconds = Math.floor(duration * pos % 60);
     $('.timer').text('0' + minutes + ':' + seconds)
     $('.timer').css({left: relX})
     $('.marker').css({left: relX})
  });
  $('.jp-seek-bar1').mouseout(function() {
    $('.marker').hide();
    $('.timer').hide();
  });

});

//events
showEvent = function(e){
  var offset = $(this).parent().offset();
  var relX = e.pageX - offset.left;
  $('.mark-selected').removeClass('mark-selected'); // mark position
  $(this).addClass('mark-selected');
  $('.comment').css({left: relX})
  $('.comment').text(e.currentTarget.children[0].innerText);
  $('.comment').show();
  $('.mark-play').css({left: relX})
  $('.mark-play').show();
}

save = function(pos, cmt){
  var filename = getFilename();
  var allMarks = localStorage.getObject('mycast.io-marks');
  var fileMarks = allMarks[filename] || [];
  var mark = {
    position: pos,
    time: getDuration() / 100 * pos,
    comment: cmt
  }
  fileMarks.push(mark);
  allMarks[filename] = fileMarks;
  localStorage.setObject('mycast.io-marks', allMarks);
}

render = function(){
  var filename = getFilename();
  // var filename = 'edvard-grieg-peer-gynt1-morning-mood.mp3';
  var allMarks = localStorage.getObject('mycast.io-marks');
  var fileMarks = allMarks[filename] || [];

  $.each(fileMarks, function(ind, mark){ addBar(mark.position, mark.comment, false); });
}
