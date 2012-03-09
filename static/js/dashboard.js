/***********************************************************************************************************************
DASHBOARD - CHECKED 18/01/2010
***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(data)
        {
            var dashboard_container = this;
            var dashboard = data.dashboard;
            dashboard_container.data('dashboard', dashboard);
            dashboard_container.find('.widgets').dashboard_widget_panel({widgets:dashboard.widgets});
            setTimeout
                (
                    function()
                    {
                        dashboard_container.find('.waiting').remove();
                        dashboard_container.dashboard('render_collections');
                    },
                    2000
                );
            return dashboard_container;
        },
        render_collections:function()
        {
            var dashboard_container = this;
            var dashboard = dashboard_container.data('dashboard');
            dashboard_container.find('.collections').dashboard_collections_panel({'collections':dashboard.collections});
            return dashboard_container
        },
        save:function()
        {
            var dashboard = clone(this.data('dashboard'));
            if (dashboard.collections != null)
                for (var x=0; x<dashboard.collections.length; x++)
                    dashboard.collections[x].search_results = [];
            var post_data = { dashboard:JSON.stringify(dashboard), csrfmiddlewaretoken:$('#csrf_form input').val() };
            $.post ( '/dashboard/save', post_data );
            $('#page_header').header('dashboard_saved');
            return this;
        }
    };

    $.fn.dashboard = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard' );
    }
})( jQuery );