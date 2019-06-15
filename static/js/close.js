/**
 * Created by tarena on 19-6-15.
 */
window.addEventListener("beforeunload", function (event) {
    alert("guanchuang");
    $.ajax({
        url: '/close',
        type: 'get',
        async:false,
    })
})
