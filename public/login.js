$("#Login").click(function(){
    var username = $("#txtName").val();
    username=username.trim();
    if(username=="" || username==null || username==undefined || username==" "){
        document.getElementById('errorMessage').innerHTML = 'Please enter username';
    }
    else{
        $.ajax({
            url:'/login',
            type:'post',
            data:{username:username},
            success:function(data){
                     window.location.href='/chatapp?uid='+data.uid+'&name='+data.name;
                },
            error:function(err){
                    console.log(err)
                }
            })
        }
    }
);