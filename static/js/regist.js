$(function () {
    // 判断用户名是否合法函数
    function checkname(){
        var namecheck=true;
        if($("[name=name]").val()===""){
            namecheck=false;
            return namecheck;
        }
        $.ajax({
            url:"/01-regist",
            data:"uname="+$("[name=name]").val(),
            dataType:"json",
            async:false,
            success:function (data) {
                console.log(data);
                if(data.status===0){
                    namecheck=false;
                }
            }
        });
        return namecheck;
    }
    // 当用户名输入框失去焦点时判断合法性
    $("[name=name]").blur(function(){
        $("#register-btn").prop("disabled",false);
        var name = $("[name=name]").val();
        var reg = /\w*/;
        if (reg.test(name) && name.length >= 2) {
            var result=checkname();
            if(result){
                $("#uname-tip").html("√").css("color","green");
            }else{
                $("#uname-tip").html("用户名已存在,请换一个").css("color","red");
            }
            $("#register-btn").css("background","#f89571").css("border","2px solid #f89571");
        } else {
            $(this).next("p").html("汉字、数字、字母、下划线组成，不少于2位,最长20字符").css("color", "red");
            $("#register-btn").css("background","#f7bfba").css("border","2px solid #f7bfba");
        }
    });
    var pwd1="";
    // 判断密码输入是否合法
    $("[name=pwd]").change(function () {
        $("#register-btn").prop("disabled",false);
        pwd1=$("[name=pwd]").val();
        if (pwd1.length>=6 && (pwd1.indexOf(" ")==-1)){
            $(this).next("p").html("√").css("color","green");
            $("#register-btn").css("background","#f89571").css("border","2px solid #f89571");
        } else {
            $(this).next("p").html("支持数字大小写字母不允许有空格，不少于8位，最长20字符")
                .css("color","red");
            $("#register-btn").css("background","#f7bfba").css("border","2px solid #f7bfba");
        }
    });
    // 判断密码框两次输入是否相同
    $("[name=rpwd]").change(function () {
        $("#register-btn").prop("disabled",false);
        var pwd2=$("[name=rpwd]").val();
        console.log(pwd1,pwd2);
       if (pwd1!==pwd2){
           $(this).next().html("两次密码输入不一致").css("color","red");
           $("#register-btn").css("background","#f7bfba").css("border","2px solid #f7bfba");
       }else{
           $(this).next().html("√").css("color","green");
           $("#register-btn").css("background","#f89571").css("border","2px solid #f89571");
       }
    });
    // 判断两次输入的密码是否相同
    function checkpwd(){
        if($("[name=rpwd]").val()===$("[name=pwd]").val() &&　$("[name=rpwd]").val()!==""){
            return true;
        }else{
            return false;
        }
    }
    // 设置发送验证码按钮不可用，直到输入1开头的11位手机号
    var btn = $("#idcode-btn");
    btn.attr("disabled", true);
    var phone_result=false;
    // 当输入手机号的文本框失去焦点，发送验证码按钮变为可用
    $("[name=phone]").blur(function(){
        var text=$("[name=phone]").val();
        if(text[0]==1 && text.length===11 && Number(text)){
            var params="phone="+text;
            $.get("/01-regist_phone",params,function (data) {
                if(data.status==1){
                    $("#tip-phone").html("√").css("color","green");
                    btn.removeAttr("disabled");
                    btn.css("background","#f7ac87").css("border","2px solid #f7ac87");
                    $("#register-btn").css("background","#f89571").css("border","2px solid #f89571");
                    phone_result=true;
                }else{
                    $("#tip-phone").html("此手机号码已注册,请确认").css("color","red");
                    btn.attr("disabled", true);
                    $("#register-btn").css("background","#f7bfba").css("border","2px solid #f7bfba");
                    phone_result=false;
                }
            },"json");
        }else{
            console.log(Number(text));
            $("#tip-phone").html("请输入正确手机号").css("color","red");
            btn.attr("disabled", true);
            $("#register-btn").css("background","#f7bfba").css("border","2px solid #f7bfba");
            phone_result=false;
        }
    });
    // 设置发送验证码按钮点击之后的效果（30秒倒计时）
    var code="";
    var buttonReady=true;
    btn.click(function(){
        if(buttonReady && phone_result){
            curcount=30;
            buttonReady=false;
            timer=window.setInterval(time, 1000);
            btn.attr("disabled", true);
            btn.html(curcount+"s后重发");
            var params="phone="+$("[name=phone]").val();
            $.get("/01-regist_code",params,function (data){
                if(data.status==1){
                    code=parseInt(data.code);
                }else{
                    alert("手机验证码发送错误，请确认手机号是否正确")
                }
            },"json")
        }else if(phone_result==false){
            alert("请确认手机号是否正确")
        }
    });
    function time() {
        if (curcount===0){
            window.clearInterval(timer);
            btn.removeAttr("disabled");
            btn.html("重新发送");
            buttonReady=true;
        }else{
            curcount--;
            btn.html(curcount+"s后重发");
        }
    }
    // 判断验证码是否正确
    var　code_result=false;
    $("#idcode").bind("input propertychange",function () {
       if($(this).val()!==0){
           var incode=parseInt($("#idcode").val());
           console.log(incode,code);
           if(incode==code){
               $("#codetips").text("");
               code_result=true;
           }else{
               $("#codetips").text("验证码错误");
               code_result=false;
           }
       }
    });
    $("#idcode").focus(function () {
        $("#codetips").text("");
    });
    // 设置提交按钮单击函数
    $("#register-btn").click(function () {
        if ($("[name=name]").val() == "") {
            alert("请先输入用户名");
            return
        }
        if (checkname() === false) {
            alert("您输入的用户名已存在");
            return
        }
        if ($("[name=pwd]").val() == "") {
            alert("请先设置登录密码");
            return
        }
        if(checkpwd()==false) {
            alert("两次密码输入不一致,请确认");
            return
        }
        if (phone_result == false) {
            alert("请确认输入的手机号是否正确");
            return
        }
        if(code_result==false){
            alert("验证码输入错误,请重新确认");
            return
        }
        if ($("#recept-box").prop("checked") && checkname() && checkpwd() && phone_result && code_result) {
            console.log("可以发送请求");
            var params = {
                "name": $("[name=name]").val(),
                "pwd": $("[name=pwd]").val(),
                "rpwd": $("[name=rpwd]").val(),
                "phone": $("[name=phone]").val()
            };
            $.ajax({
                url: "/regist",
                type: "post",
                data: params,
                asyn: false,
                dataType: "json",
                success: function (data) {
                    if (data.status==1) {
                        window.location.href = data.url;
                    }
                }
            });
        }
    });
});