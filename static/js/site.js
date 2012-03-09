/***********************************************************************************************************************
SITE
***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function()
        {
            $('#page_header').header();
            $('#user_home').user_home();
        },
        show_dashboard:function()
        {
            $('#user_home_container').slideUp();
            $('.dashboard').slideDown();
            $('#header').header('show_user_home_link');
        },
        show_user_home:function()
        {
            $('.dashboard').slideUp();
            $('#user_home_container').slideDown(function() { $('#user_home').user_home('refresh'); });
            $('#header').header('hide_user_home_link');
        },
        load_dashboard:function(data)
        {
            var dashboard_id = data.dashboard_id;
            $.get
            (
                '/dashboard/load/' + dashboard_id,
                function(data)
                {
                    $('.dashboard').dashboard({'dashboard':data.dashboard});
                },
                'JSON'
            );
        }
    }

    $.fn.site = function( method )
    {
        // Method calling logic
        if ( methods[method] )
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method )
            return methods.init.apply( this, arguments );
        else
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
})( jQuery );