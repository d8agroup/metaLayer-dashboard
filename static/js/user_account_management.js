/***********************************************************************************************************************
 user_account_management
 ***********************************************************************************************************************/
(function ( $ )
{
    $.fn.user_account_management = function()
    {
        var user_account_management_container = this;
        user_account_management_container.html($.tmpl('user_account_management'));
        user_account_management_container.find('#current_subscription_container').user_account_management_current_subscription();
        user_account_management_container.find('#change_subscription_container').user_account_management_change_subscription();
    };
})( jQuery );