/**
 * Created by tarena on 19-6-12.
 */
// 旧邮箱比对
function check_email(){
    $.ajax({
        url:"/update-email",
        type:"get",
        async:true,
        dataType:"json",
        success:function (data) {
            var oldemail = $("[name=oldemail]").val();
            if (oldemail != data['email']){
                $(".tip-info:first").html('邮箱错误');
                $(".updateemail-btn").attr("disabled", "Flase")
            }else {
                $(".updateemail-btn").removeAttr("disabled");
                $(".tip-info:first").html('');
            }
        }
    })
}

// 旧密码比对
function check_oldpwd() {
    $.ajax({
        url: "/update-pwd",
        type: "get",
        async: true,
        dataType: "json",
        success: function (data) {
            var oldpwd = $("[name=oldpwd]").val();
            if (oldpwd !== data['upwd']) {
                $(".tip-info:first").html('密码错误');
            } else {
                $(".tip-info:first").html('');
            }
            var newpwd=$("[name=newpwd]").val();
            var newrpwd=$("[name=newrpwd]").val();
            if(oldpwd===data['upwd'] && newpwd!=="" && newpwd===newrpwd){
                $(".updatepwd-btn").removeAttr("disabled");
            }else {
                $(".updatepwd-btn").attr("disabled", "Flase");
            }
        }
    });
}

// 确认新密码是否一致且不为空
function check_pwd() {
    var newpwd = $("[name=newpwd]").val();
    if (newpwd){
        $(".tip-info:eq(1)").html('');
    }else {
        $(".tip-info:eq(1)").html('密码不能为空');
        }
    var newrpwd = $("[name=newrpwd]").val();
    console.log(newpwd);
    console.log(newrpwd);
    if (newpwd !== newrpwd){
        $(".tip-info:last").html('两次密码输入不一致');
    }else {
            $(".tip-info:last").html('');
        }
    var oldpwd=$("[name=oldpwd]").val();
    var tip1=$(".tip-info:first").val();
    var tip2=$(".tip-info:eq(1)").val();
    var tip3=$(".tip-info:last").val();
    if(oldpwd!=="" && tip2==="" && tip2==="" && tip3===""){
        console.log(oldpwd,tip1,tip2,tip3);
        $(".updatepwd-btn").removeAttr("disabled");
    }else {
        $(".updatepwd-btn").attr("disabled", "Flase");
    }
}


// 验证码发送按钮
var get_code="";
var timer="";
function getCode() {
    var input=String(parseInt($("#nphone").val()));
    console.log(input.length);
    if ($("#nphone").val().length===11 && input.length===11){
        var phone=$("#nphone").val();
        var params={"phone":phone};
        timer=setInterval(countTime,1000);
        $("#get_code").prop("disabled",true).css("background","#a7c4b7");
        $.get("/01-regist_code",params,function (data) {
            if(data.status==1){
                get_code=data.code;
                alert("手机号码验证码发送成功,请注意查收");
            }else{
                alert("手机号码验证码发送失败,请确认");
            }
        },"json")
    }else if($("#nphone").val().length===0){
        alert("请先输入新手机号码")
    }else if($("#nphone").val().length!==11){
         alert("手机号码位数不足")
    }else if($("#nphone").val().length!==11){
        alert("手机号码必须是11位整数")
    }
}

// 定义定时器函数
var show=30;
function countTime(){
    $("#get_code").html(show+"s后重发");
    show--;
    if(show==-1){
        clearInterval(timer);
        $("#get_code").html("重新发送").prop("disabled",false);
        buttonReady=true;
        $("#get_code").prop("disabled",false).css("background","#7abcb8");
        show=30;
        console.log(show)
    }
}

// 提交修改手机号码按钮
function submit() {
    var ophone=$("#ophone").val();
    var pwd=$("#pwd").val();
    var nphone=$("#nphone").val();
    var uname=$("#uname").text();
    var input_code=$("#code").val();
    var params={"ophone":ophone,"pwd":pwd,"nphone":nphone,"uname":uname,"code":get_code,"input_code":input_code};
    var oinput=String(parseInt($("#ophone").val())).length===11;
    var ninput=String(parseInt($("#nphone").val())).length===11;
    var code=String(parseInt($("#code").val())).length===6;
    console.log("1",oinput,"2",ninput,"3",code);
    if ($("#ophone").val().length===11 && oinput && ninput && code){
        console.log("fhgdfghfg");
        $.get("/modify_phone",params,function (data) {
            console.log(data);
            if(data["status"]==1){
                alert("修改成功");
                window.location.href="/center"
            }else{
                alert("修改失败,请确认输入信息的正确性")
            }
        },"json")
    }else if($("#ophone").val().length===0){
        alert("请先输入旧手机号码")
    }else if($("#nphone").val().length===0){
        alert("请先输入新手机号码")
    }else if($("#code").val().length===0){
        alert("请先输入验证码")
    }else if(oinput===false){
        alert("旧手机号码输入位数不足11位")
    }else if(ninput===false){
        alert("新手机号码输入位数不足11位")
    }else if(code===false){
        alert("验证码输入错误")
    }
}


// 导航标签点击后改变选中效果并获取对应内容
$(function () {
    $("#write-info").click(function () {
        $.ajax({
            url:"/center-server",
            type:"get",
            async:true,
            dataType:"json",
            success:function (data) {
                var html="";
                html += '<form action="/center-server" method="post" enctype="multipart/form-data">'+
                '<p>实名：<input type="text" value="'+data['truename']+'" name="truename" class="input" maxlength="16"></p>'+
                '<p>性别：<input type="text" value="'+data['sex']+'" name="sex" class="input" maxlength="8"></p>'+
                '<p>邮箱：<input type="text" value="'+data['email']+'" name="email" class="input" maxlength="64"></p>'+
                '<p>生日：<input type="date" value="'+data['birthday']+'" name="birthday" class="input"></p>'+
                '<p>地区：<input type="text" value="'+data['addr']+'" name="addr" class="input" maxlength="64"></p>'+
                '<p>行业：<input type="text" value="'+data['profession']+'" name="profession" class="input" maxlength="64"></p>'+
                '<p>职位：<input type="text" value="'+data['job']+'" name="job" class="input" maxlength="32"></p>'+
                '<p>简介：<input type="text" value="'+data['intro']+'" name="intro" class="input" maxlength="200"></p>'+
                '<input type="submit" value="修改" class="submit-btn">'+
            '</form>';
                $("#info").html(html);
            }
        });
    });

    // 修改密码的点击事件
    $("#update-pwd").click(function () {
        var html="";
        html += '<form action="/update-pwd" method="post" class="updatepwd-form">'+
            '<p>&nbsp;&nbsp;&nbsp;原密码<input type="password" name="oldpwd" class="pwdinput" onblur="check_oldpwd()">'+
            '<span class="tip-info"></span></p>'+
            '<p>&nbsp;&nbsp;&nbsp;新密码<input type="password" name="newpwd" class="pwdinput" onblur="check_pwd()">'+
            '<span class="tip-info"></span></p>'+
            '<p>确认密码<input type="password" name="newrpwd" class="pwdinput" onblur="check_pwd()">'+
            '<span class="tip-info"></span></p>'+
            '<input type="submit" value="确认修改" class="updatepwd-btn" disabled="False">'+
            '</form>';
        $("#info").html(html);
        });


// 修改邮箱的点击事件
    $("#update-email").click(function () {
        $.ajax({
            url:"/update-email",
            type:"get",
            async:true,
            dataType:"json",
            success:function (data) {
                if (data['email']){
                    var html="";
                    html += '<form action="/update-email" method="post" class="update-email-form">'+
                    '<p>&nbsp;&nbsp;&nbsp;原邮箱<input type="text" name="oldemail" class="emailinput" onchange="check_email()">'+
                    '<span class="tip-info"></span></p>'+
                    '<p>&nbsp;&nbsp;&nbsp;新邮箱<input type="text" name="newemail" class="emailinput">'+
                    '<span class="tip-info"></span></p>'+
                    '<input type="submit" value="确认修改" class="updateemail-btn" disabled="False">'+
                    '</form>';
                    $("#info").html(html);
                }else {
                    alert("该用户未添加邮箱");
                }
            }
        });

        });
//修改图像
    $("#modify_img").click(function(){
        var name=$("#uname").text;
        var html="";
        html+='<form action="/modify_img" method="post" enctype="multipart/form-data"><p>上传图片:<input type="file" name="user_img"></p>';
        html+='<input type="text" name="uname" value='+name+' style="display:none"><button>提交</button></form>';
        $("#info").html(html);
    })

    // 点击修改手机显示修改界面
    $("#modify_phone").click(function () {
        var html="";
        html+='<div id="zone"><p><span>旧手机号:</span><input type="text" id="ophone" placeholder="请输入旧手机号" maxlength="11"></p >';
        html+='<p><span>密码: </span><input type="password" id="pwd" placeholder="请输入密码"></p >';
        html+='<p><span>新手机号: </span><input type="text" id="nphone" placeholder="请输入新手机号" maxlength="11"></p >';
        html+='<p><span>验证码: </span><input type="text" id="code" placeholder="请输入验证码">';
        html+='<button  onclick="getCode()" id="get_code">发送验证码</button></p ></div>';
        html+='<button id="submit_btn" onclick="submit()">提交</button> </div>';
        $("#info").html(html);
    });


});
