/***********************************************************************************************************************
 DASHBOARD - dashboard_search_widget_control_panel - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_search_widget_options_panel = function(options)
    {
        var refresh_button_click_function = function()
        {
            alert('TODO: This is not yet active');
        };

        var explore_button_click_function = function(button)
        {
            var search_filters = button.parents('.search_widget').find('.search_filters');
            if (search_filters.is(':visible'))
                search_filters.slideUp();
            else
                search_filters.slideDown();
        };

        var close_button_click_function = function(button)
        {
            button.parents('.collection_container').dashboard_collection('remove');
        };

        var search_widget_options_panel = this;
        search_widget_options_panel.append( $.tmpl('dashboard_search_widget_options_panel') );
        search_widget_options_panel.find('a.refresh_data').click( function() { refresh_button_click_function(); } );
        search_widget_options_panel.find('a.explore_data').click( function() { explore_button_click_function($(this)); } );
        search_widget_options_panel.find('a.close_collection').click( function() { close_button_click_function($(this)); } );
        return search_widget_options_panel;
    };
})( jQuery );
