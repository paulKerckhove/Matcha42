$(document).ready(function() {
  var socket = io();
  if (noPicture == true){
    var stopLikeBtn = document.getElementById('likeButton')
    stopLikeBtn.disabled = "disabled";

  }




    const button = document.querySelector('#likeButton');
    const blockButton = document.querySelector('#blockUser');
    const chatButton = document.querySelector('#btnChat');
    let check = false;
    var str = window.location.href;
    var userUrl = str.slice(28);
    var data = {};
    data.userUrl = userUrl;



    button.addEventListener('click', function () {

      if (like[0]) {
        button.innerHTML === 'like';

      } else if (button.innerHTML === 'liked') {
        button.innerHTML = 'like';

      } else if (button.innerHTML === 'like' && like[0]){
        button.innerHTML = 'liked'

      } else if (button.innerHTML === 'like'){
        button.innerHTML = 'liked'

      }

      $.ajax({
        url: '/likeUser',
        type: 'POST',
        cache: false,
        data: data,
        dataType: 'json',
        success: function(data){
      //  console.log("post success");
     },
     error: function(data) {
       window.location.href = '/profile'
     }
     });
    })



  $("#ReportFakeUser").click(function() {
    var str = window.location.href;
    var userUrl = str.slice(28);
    var data = {};
    data.userUrl = userUrl;
    alert("You have reported " + userUrl + " as a fake user")
  })



  blockButton.addEventListener('click', function () {
    var str = window.location.href;
    var userUrl = str.slice(28);
    var data = {};
    data.userUrl = userUrl;
    alert("You have blocked " + userUrl)

    $.ajax({
      url: '/likeUser/blockUser',
      type: 'POST',
      cache: false,
      data: data,
      dataType: 'json',
      success: function(data){
    //  console.log("post success");
     },
     error: function(data){
    //  console.log("please");
                     }
                   });
  })


  chatButton.addEventListener('click', function(){
    var str = window.location.href;
    var userUrl = str.slice(28);
    var data = {};
    data.userUrl = userUrl;

    $.ajax({
      url: '/likeUser/chatCheck',
      type: 'post',
      data: data,
      success: function(result){
        if (typeof result.elem == 'undefined'){
          window.location.href = '/users/'+ userUrl;
        } else {
            window.location.href = '/chatting/'+ result.elem[0].id;
        }
      },
      error: function(result){
        window.location.href = '/users/'+ userUrl;
      }
    })
  })




})
