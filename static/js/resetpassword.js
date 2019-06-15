/*
    重新设置密码页面的特效
*/
$(document).ready(function () {
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
    var buttonReady=true;
    //手机号输入框定长11位
    $(".phone_input").bind("input propertychange",function() {
        var judge=String(parseInt($(this).change().val())).length==$(this).change().val().length;
        console.log(judge,String(parseInt($(this).change().val())).length);
        if ($(".phone_input").val().length==11 && judge) {
            $(".uphone").css("display", "none");
            phone=true;
        }else if($(this).change().val().length!=0 && !judge){
            $(".uphone").text("手机号必须都为数字").css("display", "inline-block");
            phone=false;
        }else{
            $(".uphone").css("display","none");
        }
    });
    // 判断手机号是否为11位
    $(".phone_input").blur(function () {
        var judge=String(parseInt($(this).val())).length==$(this).val().length;
        if ($(".phone_input").val().length==11 && judge){
            var params="phone="+$(".phone_input").val();
            console.log(params);
            $.get("/03-reset",params,function (data) {
                console.log(data);
                if(data.status===1){
                    $(".uphone").css("display", "none");
                    phone=true;
                    $(".codebtn").prop("disabled",false).css("background","lightpink")
                }else{
                    $(".uphone").text("手机号错误或未注册").css("display", "inline-block");
                    phone=false;
                    $(".codebtn").prop("disabled",true).css("background","#d89fa8")
                    console.log($(".uphone").text)
                }
            },"json")
        }else if($(this).change().val().length!=0 && !judge){
            $(".uphone").text("手机号必须都为数字").css("display", "inline-block");
            phone=false;
            $(".codebtn").prop("disabled",true).css("background","##d89fa8")
        }else if($(".phone_input").val().length==0){
            $(".uphone").css("display", "none")
        }else{
            $(".uphone").text("手机输入位数少于11位").css("display", "inline-block");
            phone=false;
            $(".codebtn").prop("disabled",true).css("background","#d89fa8")
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
    // 按钮的单击发送验证码
    var show=30;
    var code="";
    $(".codebtn").click(function () {
        if(phone && buttonReady){
            timer=setInterval(countTime,1000);
            $(".codebtn").prop("disabled",true).css("background","#d89fa8");
            buttonReady=false;
            var params="phone="+$(".phone_input").val();
            $.get("/01-regist_code",params,function (data) {
                if(data.status==1){
                    code=parseInt(data.code);
                }else{
                    alert("手机验证码发送错误，请确认手机号是否正确")
                }
            },"json")
        }else if($(".phone_input").val()==""){
            alert("请先输入手机号码")
        }else if(phone==false){
            alert("手机号码输入有误,请确认")
        }
    });
    // 定义定时器函数
    function countTime(){
        $(".right .line .codebtn").html(show+"s后重发");
        show--;
        if(show==-1){
            clearInterval(timer);
            $(".right .line .codebtn").html("重新发送").prop("disabled",false);
            buttonReady=true;
            $(".codebtn").prop("disabled",false).css("background","lightpink");
            show=30;
            console.log(show)
        }
    }
    // 设置验证码框失去焦点判断验证码是否正确
    var  code_result=false;
    $("#code").blur("input propertychange",function () {
        var inputCode=parseInt($("#code").val());
        console.log(inputCode,code);
        if(code==inputCode){
            code_result=true
        }else if($("#code").val().length!==0){
            alert("验证码错误,请重新确认")
        }
    });
    // 判断数据是否可以提交
    $(".but").mouseover(function (){
        var result=phone && password && confirm_password && code_result;
        console.log(result,phone,password,confirm_password);
        if(result){
            $(".but").attr("type","submit")
        }else if(phone==false){
            $(".but").attr("type","")
        }
    });
});
