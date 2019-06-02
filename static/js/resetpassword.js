/*
    重新设置密码页面的特效
*/
$(document).ready(function () {
    $("input").val("");
    var password=false;
    //设置密码输入不可少于6位
    $(".first_psw").bind("input propertychange",function() {
        if($(".first_psw").val().length<6){
            $(".resetPSW").css("display","inline-block");
            password=false;
        }else{
            $(".resetPSW").css("display","none");
            password=true;
        }
    });
    var confirm_password=false;
    //确认密码两次输入密码不相等
    $(".second_psw").bind("input propertychange",function(){
        if($(".first_psw").val()===$(".second_psw").val()){
            $(".second_psw").parent().siblings("span").css("display","none");
            confirm_password=true;
        }else{
            $(".second_psw").parent().siblings("span").css("display","inline-block");
            confirm_password=false;
        }
    });
    var phone=false;
    //手机号输入框定长11位
    $(".phone_input").bind("input propertychange",function() {
        var judge=String(parseInt($(this).change().val())).length==$(this).change().val().length;
        console.log(judge,String(parseInt($(this).change().val())).length);
        if ($(".phone_input").val().length==11 && judge) {
            $(".uphone").css("display", "none");
            phone=true;
            $(".codebtn").prop("disabled",false).css("background","lightpink")
        }else if($(this).change().val().length!=0 && !judge){
            $(".uphone").text("手机号必须都为数字").css("display", "inline-block");
            phone=false;
            $(".codebtn").prop("disabled",true).css("background","#A7948C")
        }else{
            $(".uphone").css("display","none");
            $(".codebtn").prop("disabled",false).css("background","lightpink")
        }
    });
    // 判断手机号是否为11位
    $(".phone_input").blur(function () {
        var judge=String(parseInt($(this).change().val())).length==$(this).change().val().length;
        if ($(".phone_input").val().length==11){
            $(".uphone").css("display", "none");
            phone=true;
            $(".codebtn").prop("disabled",false).css("background","lightpink")
        }else if($(this).change().val().length!=0 && !judge){
            $(".uphone").text("手机号必须都为数字").css("display", "inline-block");
            phone=false;
            $(".codebtn").prop("disabled",true).css("background","#A7948C")
        }else if($(".phone_input").val().length==0){
            $(".uphone").css("display", "none")
        }else{
            $(".uphone").text("手机输入位数少于11位").css("display", "inline-block");
            phone=false;
            $(".codebtn").prop("disabled",true).css("background","#A7948C")
        }
    });
    //设置密码输入框获取焦点是取消提示
    $(".first_psw").focus(function () {
        $(".resetPSW").css("display","none");
        $(this).siblings("b").css("display","none");
    });
    //确认密码输入框获取焦点是取消提示
    $(".second_psw").focus(function () {
        $(".reputPSW").css("display","none")
    });

    // 设置手机号输入框取焦点是取消提示
    $(".phone_input").focus(function () {
        $(this).parent().siblings("b").css("display","none")
    });

    // 设置验证码框获取焦点是取消提示
    $(".code").focus(function () {
        $(this).parent().siblings("b").css("display","none")
    });

    //输入框中有文本是“x”图片显示，没有文本则图片阴藏
    $(".inline input").bind("input propertychange",function(){
        if($(this).val().length>=1){
            $(this).siblings(".clear").css("display","block")
        }else{
            $(this).siblings(".clear").css("display","none")
        }
    });
    // 点击图片清空输入框内容
    $(".line .clear").click(function(){
        $(this).siblings("input").val("");
        $(this).css("display","none")
    });
    // 鼠标移到图片上时更换图片地址
    $(".line .clear").mouseover(function(){
        $(this).attr("src","../static/images/input2.png")
    });
    // 鼠标移到图片上时更换图片地址
    $(".line .clear").mouseout(function(){
        $(this).attr("src","../static/images/input1.png")
    });

    // 判断数据是否可以提交
    $(".but").mouseover(function (){
        var result=phone && password && confirm_password;
        console.log(result,phone,password,confirm_password);
        if(result){
            $(".but").attr("type","submit")
        }else{
            $(".but").attr("type","")
        }
    });
    //如果手机号输入框为空则不可点击发送验证码button
    $(".right .line .codebtn").mouseover(function () {
        if($(".phone_input").val().length==0){
            $(".right .line .codebtn").prop("disabled",true)
        }
    })
    // 按钮的单击发送验证码
    var show=30;
    $(".right .line .codebtn").click(function () {
        timer=setInterval(countTime,1000);
        $(".right .line .codebtn").prop("disabled",true)
    });
    // 定义定时器函数
    function countTime(){
        $(".right .line .codebtn").html(show+"s后重发");
        show--;
        if(show==-1){
            clearInterval(timer);
            $(".right .line .codebtn").html("重新发送");
            $(".right .line .codebtn").prop("disabled",false)
        }
    }
    // 验证码错误提示内容显示时间
    var timerID=setTimeout(function(){
        $(".code").css("display","none");
        console.log("结束");
    },3000);
    clearTimeout(timerID);
    // 手机错误提示内容显示时间
    var timer=setTimeout(function showPhone(){
        $(".uphone").siblings("b").css("display","none");
        console.log("结束");
    },3000);
    clearTimeout(timer)

});
