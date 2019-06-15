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
                '<p>邮箱：<input type="text" value="'+data['email']+'" name="email" class="input"></p>'+
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



})
