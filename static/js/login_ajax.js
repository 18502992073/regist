/**
 * Created by tarena on 19-6-3.
 */
$(function () {
    function checkname() {
        //定义判断用户名是否存在函数
        var res=true;
        $.ajax({
            url: "/02-login",
            type:"get",
            async:false,
            data:"uname="+$("#uname").val(),
            dataType:"json",
            success:function (data){
                if(data.status===0){
                    res=false
                }
            }
        });
        return res;
    }
    //用户名输入框绑定实时监控输入时间
    $("#uname").bind("input propertychange",function(){
        $("#btnLogin").prop("disabled",false);
        if($(this).val().length!==0){
            if(checkname()){
                $("#tigs").html("");
            }else{
                $("#tigs").html("账号不存在");
            }
        }else{
            $("#tigs").html("");
        }
    });
    //提交登录框绑定鼠标移入函数
    $("#btnLogin").mouseover(function(){
        var res=checkname();
        if(res===false && $("#uname").val().length!==0){
            alert("账号不存在,请确认");
            $(this).prop("disabled",true);
        }else{
            $(this).prop("disabled",false);
        }
    });
});