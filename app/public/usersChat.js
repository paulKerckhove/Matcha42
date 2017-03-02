$(document).ready(function() {


  const chatButton = document.querySelector('.chatButton');
  var socket = io();


  var chatAppend = function(msg, curr){
    $('.chatConvo').append("<li class='chatLi'>" + curr + ' : ' + msg + "</li>")
  }

  if (rows) {
    var chatHistory = $();
    for(x = 0; x < rows.length; x++) {
        chatHistory = chatHistory.add('<li>'+ rows[x].user_1 + " : " + rows[x].content +'</li>');
    }
    $('.chatConvo').append(chatHistory);
  }


  socket.emit('init', username);
  socket.on('message', function(msg){
    // console.log(msg);
    // console.log(msg.curr);
    chatAppend(msg.msg, msg.curr);

  })



  // $("#m").keypress(function(event) {
  //     if (event.which == 13) {
  //         event.preventDefault();
  //         $("form").submit();
  //     }
  // });

  chatButton.addEventListener('click', function (e) {
    e.preventDefault()



    $.ajax({
             url: '/chatting/chatMsg',
             type: 'POST',
             data: {
               msg: $('.chatInput').val()
             },
             success: function(data){

              }
            });
            $('.chatInput').val("");
  })




});
