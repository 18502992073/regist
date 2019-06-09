/*
    看帖内部的页面动态效果
*/
//页面加载完成后执行函数
$(function(){
    //3.轮播图
    //保存图片路径
    var baseUrl="../static/images/";
    //创建图片名数组
    var arr=["banner1.jpg","banner2.jpg","banner3.jpg","banner4.jpg","banner5.jpg"];
    var index=0;
    //设置定时器
    var timerID=setInterval(autoPlay,1000);
    //定义定时器函数
    function autoPlay(){
        index++;
        // 判断索引是否越界，如果是，index恢复为0
        if (index===arr.length){
            index=0;
            //当索引到达最后一个，把所有索引颜色恢复为默认
            $("#banner li").css("background","#999");
        }
        var url=baseUrl+arr[index];
        //前面索引恢复默认颜色
        // $("#banner li").eq(index-1).css("background","#999");
        //更改图片路径
        $("#banner>img").attr("src",url);
        //索引设置颜色
        $("#banner>ul>li").eq(index).css("background","mediumvioletred");
    }
    //鼠标移入移出轮播图暂停播放效果 #banner
    //鼠标移入停止定时器
    $("#banner").mouseover(function(){
        //关闭定时器
        clearInterval(timerID)
    });
    //鼠标移出重启定时器
    $("#banner").mouseout(function(){
        //开启定时器
        timerID=setInterval(autoPlay,1000);
    });

    //左右方向按钮的实现
    //左侧按钮加单击
    $("#banner a.left").click(function (){
        index--;
        //放在索引越界
        if(index==-1){
            index=arr.length-1;
            //把所有索引更改颜色
            $("#banner li").css("background","mediumvioletred")
        }
        //生成图片路径
        var url=baseUrl+arr[index];
        //修改显示路径
       $("#banner>img").attr("src",url);
        //当前索引修改颜色
        $("#banner li").eq(index+1).css("background","#999")
    });
    //右侧按钮加单击
    $("#banner a.right").click(function (){
        //自动播放函数
        autoPlay()
    });

    //遍历li,添加属性id
    //each():jquery提供的遍历对象数组方法

    for(var i=0;i<arr.length;i++){
        //为对象添加属性ind,表示下标
        $("#banner li")[i].ind=i;
        //添加绑定单击事件
        $("#banner li").eq(i).click(function(){
            var index=$(this).prop("ind");
            var url=baseUrl+arr[index];

            //更改前面的索引和当前的颜色
            $("#banner li:lt("+index+1+")").css("background","mediumvioletred");
            //修改显示路径
            $("#banner>img").attr("src",url);
            //更改之后索引颜色
            $("#banner li:gt("+index+")").css("background","#999");
            });
    }

    // 评论框获取焦点显示提交
    $(".comment .comment_text").focus(function () {
        console.log("获取焦点");
        $(this).css("height","120px");
        $(this).parent().children().css("display","inline-block")
    });

    // 评论框失去焦点影藏，若框内有文字则不隐藏
    $(".comment .comment_text").blur(function (){
        console.log("失去焦点");
        if($(this).val()==""){
            $(this).css("height","20px");
            $(this).parent().children().css("display","none");
            $(this).css("display","inline-block");
        }
    });

    // 显示还剩下多少字符可输入
    var word_count=800;
    $(".comment .comment_text").bind("input propertychange",function(){
        var write=$(this).val().length;
        var write_last=word_count-write;
        console.log(write_last);
        if (write_last<=0){
            $(this).siblings("label").children().text(0);
        }else{
            $(this).siblings("label").children().text(write_last);
        }
    });

    // 评论
    $("#submit-comment").click(function () {

    })



});