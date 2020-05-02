
(function ($) {
    "use strict";
    $( document ).ready(function() {
        if(sessionStorage.user) {
            $('#welcome').html('Welcome ' + USER.username)
            // $('#stage').show('slow');
            $('#stage').removeClass('hidden');
        }


    });

})(jQuery);

const logout = () => {
    SOCKET.endSession();
    sessionStorage.removeItem('user');
    USER = null;
    window.location.href = "/login";
};
