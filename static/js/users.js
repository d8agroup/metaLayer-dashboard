/***********************************************************************************************************************
user_home
***********************************************************************************************************************/
(function ( $ )
{
    var methods =
    {
        init:function()
        {
            this.user_home('refresh');
        },
        refresh:function()
        {
            this.find('#user_dashboard_management_container').user_dashboard_management();
            this.find('#user_account_management_container').user_account_management();
        }
    }

    $.fn.user_home = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
})( jQuery );

