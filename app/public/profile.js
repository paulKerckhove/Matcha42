//Ajax request file

$(document).ready(function() {
  var socket = io();
  socket.emit('init', username);

  $('.full-circle-notif-count').hide();
  socket.on('notification', function(){
    //console.log('view from');
    /*view_notification = true;*/
    $('.full-circle-notif-count').toggle();
    })
  socket.on('like', function(){
    //console.log('like from',userUrl);
    $('.full-circle-notif-count').toggle();
    })
  socket.on('unlike', function(){
    //console.log('unlike from',userUrl);
    $('.full-circle-notif-count').toggle();
    })
  socket.on('message', function(msg){
    //console.log(msg.curr);
    //chatAppend(msg.msg, msg.curr);
    $('.full-circle-notif-count').toggle();
    })
  $("#updateBio").click(function() {
    event.preventDefault();
    var data = {};
    data.sex = $('[name=sex]:checked').val();
    data.orientation_filter = $('[name=orientation_filter]:checked').val();
    data.age = $('[name=age]').val();
    data.bioBox = $('#commentBox').val();
    data.firstName = $('#firstNameInput').val();
    data.lastName = $('#lastNameInput').val();
    data.userEmail = $('#userEmailInput').val();


    $.ajax({
             url: '/profile/profile',
             type: 'POST',
             cache: false,
             data: data,
             /*contentType: 'application/json',*/
             dataType: 'json',
             success: function(data){
                alert("post success")
              },
              error: function(data) {
                //window.location.href = '/profile'
              }
            });
          });

  $("#changeGenderBio").click(function() {
    event.preventDefault();
    var data = {};
    data.sex = $('[name=sex]:checked').val();
    data.orientation_filter = $('[name=orientation_filter]:checked').val();
    data.age = $('[name=age]').val();
    data.bioBox = $('#commentBox').val();

    $.ajax({
             url: '/profile/changeGenderBio',
             type: 'POST',
             cache: false,
             data: data,
             dataType: 'json',
             success: function(data){
                alert("post success")
              },
              error: function(data) {
                window.location.href = '/profile'
              }
            });
          });


    $("#saveTags").click(function() {
      var datas = {};
      var userTags = {};
      event.preventDefault();
      userTags = $('#my-tag-list').tags({
      getTags() {

      }
    });
    datas.userTags = userTags.getTags();
    if (datas.userTags.length <= 1){
      alert('Enter a minimum of 3 tags so we can match you with others of your kind, fool !');
      return;
    }
    /*console.log(datas.userTags);*/

    $.ajax({
       url: '/profile/tagsPost',
       type: 'POST',
       cache: false,
       data: datas,
       dataType: 'json',
       success: function(data){
          alert("post success")
        },
        error: function(data) {
          window.location.href = '/profile'
        }
      });
    });

  $("#changeTags").click(function() {
    var datas = {};
    var userTags = {};
    event.preventDefault();
    userTags = $('#my-tag-list').tags({
    getTags() {

    }
  });
  datas.userTags = userTags.getTags();


  $.ajax({
     url: '/profile/changeTags',
     type: 'POST',
     cache: false,
     data: datas,
     dataType: 'json',
     success: function(data){
        alert("post success")
      },
      error: function(data) {
        window.location.href = '/profile'
      }
    });
  });


  //Geolocation thing

  $("#geoUser").click(function(){

    geoFindMe();


  })

  function geoFindMe() {
    var data = {};
  var output = document.getElementById("out");

  if (!navigator.geolocation){
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }

  function success(position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;

    output.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>';

    var img = new Image();
    img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";

data.latitude = latitude;
data.longitude = longitude;

    uLocation = (latitude + " , " + longitude);
    $.ajax({
             url: '/profile/userLocation',
             type: 'POST',
             cache: false,
             data: data,
             dataType: 'json',
             success: function(data){
                alert("post success")
              }
            });

    output.appendChild(img);


  }

  function error() {
    output.innerHTML = "Unable to retrieve your location";
  }

  output.innerHTML = "<p>Locating…</p>";

  navigator.geolocation.getCurrentPosition(success, error);
}

$("#noGeoUser").click(function(){
/* var data = {};*/
  location.reload();
  $.getJSON("http://ip-api.com/json/?callback=?", function(data) {
    /*console.log(data);*/
      var table_body = "";
      $.each(data, function(k, v) {
          table_body += "<tr><td>" + k + "</td><td><b>" + v + "</b></td></tr>";
      });
      $("#GeoResults").html(table_body);
      /* console.log(table_body); */

      $.ajax({
               url: '/profile/userLocationDenied',
               type: 'POST',
               cache: false,
               data: data,
               dataType: 'json',
               success: function(data){
                  alert("post success")
                }
              });
            });
          });


  //Geolocation search thing

$('#city').click(function(){
  var data = {};
  var search = $('#search').val()
  data.search = search;


  $.ajax({
           url: '/profile/userLocationSearch',
           type: 'POST',
           cache: false,
           data: data,
           dataType: 'json',
           success: function (response) {
             if(response.status == 200){
               alert("Location has been updated");
               $('#search').val("");
             } else if (response.status == 400){
               $('#search').val("");
               alert("Wrong input");
             }
           }
          });
        });


$('#matchMe').click(function(){

  $.ajax({
           url: '/profile/matchaSearch',
           type: 'POST',
           cache: false,
           data: data,
           dataType: 'json',
           success: function(data){
              alert("post success")
            }
          });
});


$('#ageSubmit').click(function(){
  var data = {};
  data.age1 = $('[name=ageSearch1]').val();
  data.age2 = $('[name=ageSearch2]').val();
  console.log(data);


  $.ajax({
           url: '/profile/ageSuggest',
           type: 'POST',
           cache: false,
           data: data,
           dataType: 'json',
           success: function(data){
              alert("post success")
            }
          });

  });






});




/*
ageSubmit
tagsSubmit
locationSubmit
popScoreSubmit
*/
