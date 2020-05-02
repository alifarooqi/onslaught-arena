// Check if user is logged in or not
var USER = sessionStorage.getItem('user');
if(!USER){
    window.location.href = "/login"
}
else
    USER = JSON.parse(USER);

