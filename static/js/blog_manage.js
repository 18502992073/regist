$(function () {
    // 筛选标签点击后改变颜色
    $(".filter").click(function () {
        $(".filter").css("color","#444");
        $(this).css("color","red");
    });

    // 筛选(默认、按时间、按访问量)标签点击效果
    // 1.默认标签点击效果
    $("#filter1").click(function () {
        $.ajax({
            url:"/blog_manage_server1",
            type:"get",
            async:true,
            dataType:'json',
            success:function (data) {
                var html='';
                for(var i=0;i<data.length;i++){
                    console.log(i,data[i])
                    html += '<div class="list">';
                    html += '<div class="delete">删除</div>';
                    html += '<h4><a href="/blog">'+data[i].title+'</a></h4>';
                    html += '<p>'+data[i].content+'</p><div>';
                    html += '<span style="color: #222;">'+data[i].time+'</span>';
                    html += '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #222;">评论数</span>';
                    html += '<span style="color: #33A6EF;">'+data[i].comment_num+'</span>&nbsp;';
                    html += '<span style="color: #222;">|</span>&nbsp';
                    html += '<span style="color: #222;">点赞数</span><span style="color: #33A6EF;">2264</span>';
                    html += '</div></div>';
                }
                $("#right-bottom").html(html);
            }
        })
    });
    // 2.按时间标签点击效果
    $("#filter2").click(function () {
        $.ajax({
            url:"/blog_manage_server1",
            type:"get",
            async:true,
            dataType:'json',
            success:function (data) {
                var html='';
                for(var i=data.length-1;i>=0;i--){
                    html += '<div class="list">';
                    html += '<div class="delete">删除</div>';
                    html += '<h4><a href="/blog">'+data[i].title+'</a></h4>';
                    html += '<p>'+data[i].content+'</p><div>';
                    html += '<span style="color: #222;">'+data[i].time+'</span>';
                    html += '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #222;">评论数</span>';
                    html += '<span style="color: #33A6EF;">'+data[i].comment_num+'</span>&nbsp;';
                    html += '<span style="color: #222;">|</span>&nbsp';
                    html += '<span style="color: #222;">点赞数</span><span style="color: #33A6EF;">2264</span>';
                    html += '</div></div>';
                }
                $("#right-bottom").html(html);
            }
        })
    });


    // 移除操作
    $(".delete").click(function () {
        var res=confirm("确定要删除吗？");
        if (res){
            $(this).parent("div").remove();
            $.ajax({
                url:"/blog_manage_delete",
                data:"title="+$(this).next("h4").children("a").html(),
                type:"get",
                async:true,
                success:function (data) {
                    if (data==="1"){
                        alert("删除成功");
                        window.location.reload();
                    }else {
                        alert("删除失败");
                    }
                }
            })
        }
    });

    // 轮播图
   // 保存图片路径
   var baseUrl = "../static/images/";
   var arr = ["banner1.jpg","banner2.jpg","banner3.jpg","banner4.jpg", "banner5.jpg"];
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