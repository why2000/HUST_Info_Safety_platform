'use strict'

let courseid;
let username;
let courselist;
let videolist;
let classname;

$(document).ready(function () {
  courseid = window.location.href.substring(window.location.href.lastIndexOf('#') + 1, window.location.href.length);
  $('#class-to-exam').attr('href', `/exam/index#${courseid}`);
  $('#class-to-feedback').attr('href', `/feedback/index#${courseid}`);
  $('#class-to-courseware').attr('href', `/courseware/course/${courseid}`);
  $('#class-home-page').attr('href', `/tutorial/index#${courseid}`);
  $('#class-to-video').attr('href', `/tutorial/video#${courseid}`);
  $('#class-to-logout').attr('href', `/login/logout`);
  $(".has-submenu").hover(function () {
    var height;
    var current_list = $(this).find('.submenu').attr("id");
    current_list = current_list.split('-').join('');
    if (current_list != null && current_list != undefined) {
      height = eval(current_list).length * 41;
    } else {
      height = 0;
    }
    $('#sidebar-back').css('display', 'none');
    $(this).find('.submenu').stop().css("height", `${height}px`).slideDown(300);
    $(this).find(".mlist-icon").addClass("fa-rotate-90").css("width", "30px").css("transform", "translateY(-12px) rotate(90deg)");
  }, function () {
    $(this).find(".submenu").stop().slideUp(300);
    $(this).find(".mlist-icon").removeClass("fa-rotate-90").css("width", "55px").css("height", "36px").css("transform", "");
    $('#sidebar-back').css('display', '');
  });
  $(".main-menu").hover(function () {
    $(".settings").stop().animate({
      opacity: 1
    }, 100);
    // $(".settings").css("visibility", "");
  }, function () {
    $(".settings").stop().animate({
      opacity: 0
    }, 300);
    // $(".settings").css("visibility", "hidden");
  });
  getCourseList();
  getVideoList();
  getUserName();
}).on('click', '.video-select-item', function () {
  $('.video-select-item').removeClass('list-group-item-success');
  $(this).addClass('list-group-item-success');

  let vid = $(this).attr('vid');
  // $.get({
  //   url: `/tutorial/${courseid}/${vid}`
  // }).done(result => {
  //   $('#video-description').text(result.data.description);
  // })

  let v = videolist.filter(i => i._id === vid)[0]
  $('#video-description').text(v.description)
  setVideo(v.file_id);
})

function getVideoList() {
  $.get({
    url: `/courseware/videolist/` + courseid
  }).done(result => {
    videolist = result.data;
    let html = '';
    for (let n = 0; n < videolist.length; n++) {
      html += '<a class="list-group-item list-group-item-action video-select-item" vid="' + videolist[n]._id + '">'
        + "  视频名称: " + videolist[n].title
        + '</a>';
    }
    $('#video-select').empty().append(html);
  })
}

function getCourseList() {
  $.get({
    url: '/course',
  }).done(result => {
    courselist = result.data;
    $('#course-list').empty();
    for (let i = 0; i < courselist.length; i++) {
      $('#course-list').append(`<li><a href="/tutorial/index#${courselist[i]._id}"><i class="fa fa-dot-circle-o fa-lg"></i><span class="nav-text-small">${courselist[i].name}</span></a></li>`);
    };
    let selectedCourse = courselist.filter(e => {
      return e._id == courseid;
    });
    classname = selectedCourse[0].name;
    setCourseName();
  });
}

function logout() {
  $.get({
    url: '/login/logout'
  }).done(function () {
    alert("退出成功！");
    window.location.href = '/';
  })
}

function getUserName() {
  $.get({
    url: '/user/username'
  }).done(result => {
    username = result.result.username;
    setUserName();
  })
}

function setUserName() {

  if (!username) {
    username = "数据获取失败";
  }
  var hello = "欢迎！" + username;
  $(".settings").text(hello);
}

function setCourseName() {
  if (classname) {
    $('#big-title').text('观看视频 当前课程: ' + classname);
  }
}

function setVideo(videofile) {
  $('.video-body').empty().append(`<div class="flowplayer"><video controls="controls" width="100%"><source type="video/mp4" src='/file/${videofile}'></video></div>`)
}