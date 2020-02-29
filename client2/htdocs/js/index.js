// Check if user is logged in or not
let USER = null;
if(!sessionStorage.user){
    window.location.href = "/login"
}
else
    USER = JSON.parse(sessionStorage.user);

const logout = ()=>{
    delete sessionStorage['user'];
    USER = null;
    window.location.href = "/login"
};
