
(function ($) {
    "use strict";
    $( document ).ready(function() {
        if(sessionStorage.user) {
            $('#welcome').html('Welcome ' + USER.username)
            $('#stage').show('slow');
        }


    });

})(jQuery);