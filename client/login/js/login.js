var socket = io();


(function ($) {
    "use strict";

    $('.limiter').show('slow');

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    });
  
  
    var input = $('.validate-input .input100');

    /*==================================================================
    [ Login ]*/


    $('#login-btn').on('click',function(e){
        e.preventDefault();
        if(isValidInput()){
            let email = $('#email-input').val();
            let password = $('#password-input').val();
            socket.emit('signIn',{
                email,
                password
            });
        }
    });

    socket.on('signInResponse',function(res){
        if(res.success){
            sessionStorage.setItem('user', JSON.stringify(res.data));
            window.location.href = "/"
        } else
            $('.login-error').show("slow")
    });


    /*==================================================================
    [ Signup]*/

    let VERIFY_EMAIL_SENT = false;


    $('#signup-btn-redirect').on('click',function(e){
        e.preventDefault();
        window.location.href = "/signup"
    });

    $('#signup-btn').on('click',function(e){
        e.preventDefault();
        $('.signup-error').hide();
        let email = $('#email-input').val();
        if (!validateEmail(email)){
            showSignupError('Please enter a valid email');
            return
        }

        if (!VERIFY_EMAIL_SENT){
            socket.emit('verify',{
                email
            });
        }
        else{
            if(isValidSignupInput()){
                let username = $('#username-input').val().trim();
                let password = $('#password-input').val();
                let verificationCode = $('#verify-code-input').val().trim();
                socket.emit('signUp',{
                    email,
                    username,
                    verificationCode,
                    password
                });
            }
        }
    });

    socket.on('verifyResponse',function(data){
        if(data.success){
            $('#email-input').prop("readonly", true);
            $('.signup-dropdown').show("slow");
            VERIFY_EMAIL_SENT = true;
        } else{
            showSignupError(data.data);
        }
    });


    socket.on('signUpResponse',function(res){
        if(res.success){
            sessionStorage.user = res.data;
            window.location.href = "/"
        } else
            showSignupError(res.data);
    });

    /*==================================================================
    [ Validate ]*/


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function isValidInput(){
        let check = true;
        for(let i=0; i<input.length; i++) {
            if(validate(input[i]) === false){
                showValidate(input[i]);
                check=false;
            }
        }
        return check;
    }

    function validate (input) {
        if($(input).attr('type') === 'email' || $(input).attr('name') === 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() === ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function isValidSignupInput() {
        let username = $('#username-input').val().trim();
        let password = $('#password-input').val();
        let repassword = $('#re-password-input').val();
        let verifyCode = $('#verify-code-input').val().trim();

        if(username === ''){
            showSignupError('Enter a valid username');
            return false;
        }

        if(password !== repassword){
            showSignupError('The passwords don\'t match.');
            return false;
        }

        if(verifyCode.length !== 6){
            showSignupError('Invalid Verification Code');
            return false;
        }
        return true;
    }

    function showSignupError(message) {
        $('.signup-error').html(message);
        $('.signup-error').show('fast');
    }
    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function(){
        if(showPass == 0) {
            $(this).next('input').attr('type','text');
            $(this).addClass('active');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type','password');
            $(this).removeClass('active');
            showPass = 0;
        }
        
    });


})(jQuery);