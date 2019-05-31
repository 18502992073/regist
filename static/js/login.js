/*
    登陆页面的特效
*/
$(document).ready(function () {
    // 点击图片清空输入框内容
    $(".clearimg").click(function () {
        $(this).siblings("input").val("");
        $(this).css("display", "none")
    });
    // 鼠标移到图片上时更换图片地址
    $(".clearimg").mouseover(function () {
        $(this).attr("src", "../static/images/input2.png")
    });
    // 鼠标移到图片上时更换图片地址
    $(".clearimg").mouseout(function () {
        $(this).attr("src", "../static/images/input1.png")
    });
    //输入框中有文本是“x”图片显示，没有文本则图片阴藏
    $(".clearinput>input").bind("input propertychange",function(){
        console.log($(this).val().length)
        if($(this).val().length>=1){
            $(this).siblings(".clearimg").css("display","block")
        }else{
            $(this).siblings(".clearimg").css("display","none")
        }
    });
    //当输入框获取焦点时，取消tips显示
    $(".clearinput input").focus(function(){
        console.log("123")
        $("#tips").removeAttr("style")
    })
});