$(function () {
    // 判断用户名是否合法
    $("[name=name]").change(function () {
        var name=$("[name=name]").val();
        uname_is_ok = false;
        console.log(name);
        var reg=/\w*/;
        if (reg.test(name) && name.length>0){
            $(this).next("p").html("√").css("color","green");
            uname_is_ok = true;
        }else {
            $(this).next("p").html("汉字、数字、字母、下划线组成,最长20字符")
                .css("color","red");
        }
    });

    // 判断密码输入是否合法
    $("[name=pwd]").change(function () {
        pwd1=$("[name=pwd]").val();
        pwd1_is_ok =false;
        if (pwd1.length>=6 && (pwd1.indexOf(" ")==-1)){
            $(this).next("p").html("√").css("color","green");
            pwd1_is_ok = true;
        } else {
            $(this).next("p").html("支持数字大小写字母不允许有空格，不少于6位，最长20字符")
                .css("color","red");
        }
    });

    // 判断密码框两次输入是否相同
    $("[name=rpwd]").change(function () {
        pwd2=$("[name=rpwd]").val();
        pwd2_is_ok = false;
       if (pwd1!==pwd2){
           $(this).next().html("两次密码输入不一致").css("color","red");
       }else {
           $(this).next().html("");
           pwd2_is_ok = true;
       }
    });

    // 设置发送验证码按钮不可用，直到输入1开头的11位手机号
    var btn = $("#idcode-btn");
    btn.attr("disabled", true);

    // 当输入手机号的文本框失去焦点，发送验证码按钮变为可用
    $("[name=phone]").blur(function () {
        var text=$("[name=phone]").val();
        if (text[0]==1 && text.length===11 && Number(text)){
            $("#tip-phone").html("√").css("color","green");
            btn.removeAttr("disabled");
            btn.css("background","#f7ac87").css("border","2px solid #f7ac87");
        }else {
            $("#tip-phone").html("请输入正确手机号").css("color","red");
            btn.css("background","gray").css("border","2px solid gray");
            btn.attr("disabled", true);
        }
    });

    // 设置发送验证码按钮点击之后的效果（30秒倒计时）
    btn.click(function () {
        curcount=30;
        timer=window.setInterval(time, 1000);
        btn.attr("disabled", true);
        btn.html(curcount+"s后重发");
    });
    function time() {
        if (curcount===0){
            window.clearInterval(timer);
            btn.removeAttr("disabled");
            btn.html("重新发送");
        } else{
            curcount--;
            btn.html(curcount+"s后重发");
        }
    }

    // 设置注册按钮不可用，直到注册信息全部填写完成
    register_btn=$("#register-btn");
    register_btn.attr("disabled",true);
    $("#recept-box").click(function () {
        if ( $("#recept-box").prop("checked") && uname_is_ok && pwd1_is_ok && pwd2_is_ok){
            register_btn.removeAttr("disabled")
                .css("background","#f89571").css("border","2px solid #f89571");
        }else {
            register_btn.attr("disabled",true)
                .css("background","gray").css("border","2px solid gray");
        }
    })
});