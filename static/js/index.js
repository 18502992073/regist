/**
 * Created by tarena on 19-6-1.
 */
$(function () {
    // 导航标签点击获取对应内容
    $(".nav").click(function () {
        $.ajax({
            url:"/index-server",
            type:"get",
            data:"tags="+$(this).html(),
            async:true,
            dataType:"json",
            success:function (data) {
                var html="";
                for(var i=data.length-1;i>=0;i--){
                    html += '<div class="list">';
                    html += '<h4><a href="/blog?blog_title='+data[i].title+'">'+data[i].title+'</a></h4>';
                    html += '<p class="show-text">'+data[i].content+'</p>'+
                        '<span style="color: #33A6EF;">'+data[i].uname+'</span><div>' +
                        '<span style="color: #222;">'+data[i].time+'</span>&nbsp;&nbsp;&nbsp;&nbsp;'+
                        '<span style="color: #222;">评论数</span>' +
                        '<span style="color: #33A6EF;">'+data[i].comments_num+'</span>&nbsp;' +
                        '<span style="color: #222;">|</span>&nbsp;' +
                        '<span style="color: #222;">点赞数</span>' +
                        '<span style="color: #33A6EF;">'+data[i].great_num+'</span></div></div>'
                }
                $("#view").html(html);
            }
        });

    })


    // 轮播图
   // 保存图片路径
   var baseUrl = "../static/images/blog_manage/";
   var arr = ["index_banner1.jpg","index_banner2.jpg","index_banner3.jpg","index_banner4.jpg", "index_banner5.jpg"];
   var index = 0;
   var timer = setInterval(autoPlay,2000);
   function autoPlay() {
       index++;
       // $("#banner li").css("background","#fff");
       if (index === arr.length){
           index = 0;
           $("#banner li").css("background","#fff");
       }
       var url = baseUrl + arr[index];
       $("#banner img").attr("src",url);
       // 索引修改
       $("#banner li").eq(index).css("background","red");
   }
   // 鼠标移入移出 #banner
   $("#banner").mouseover(function () {
       //停止定时器
       clearInterval(timer);
   }).mouseout(function () {
       // 重启定时器
       timer = setInterval(autoPlay,2000);
   });
   $("#banner a.left").click(function () {
       index--;
       // $("#banner li").css("background","#fff");
       if (index === -1){
           index = arr.length-1;
           $("#banner li").css("background","red");
       }
       var url = baseUrl + arr[index];
       $("#banner img").attr("src",url);
       // 索引修改
       // $("#banner li").eq(index).css("background","red");
       $("#banner li").eq(index+1).css("background","#fff");
   });
   $("#banner a.right").click(function () {
       autoPlay();
   });
   // 遍历li，添加属性ind
   // each()jquery提供的遍历方法
    for (var i = 0; i < arr.length; i++) {
        // 为对象添加属性ind，表示下标
        $("#banner li")[i].ind = i;
    }
    $("#banner li").click(function () {
       var url = baseUrl + arr[this.ind];
       $("#banner img").attr("src",url);
       // 索引修改
       $("#banner li:lt("+(this.ind+1)+")").css("background","red");
       $("#banner li:gt("+this.ind+")").css("background","#fff");
    });
});