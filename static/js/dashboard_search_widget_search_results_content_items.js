/***********************************************************************************************************************
 DASHBOARD - dashboard_search_results_content_items - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_search_results_content_items = function(data)
    {
        var dashboard_search_results_content_items = this;
        var content_items = data.content_items;
        for (var x=0; x<content_items.length; x++)
        {
            var template_name = 'dashboard_search_results_content_items_' + content_items[x]['channel_type'] + "_" + content_items[x]['channel_sub_type'];
            $.tmpl(template_name, content_items[x]).appendTo(dashboard_search_results_content_items);
        }
        clean_user_generated_html(dashboard_search_results_content_items);
        apply_helper_class_functions(dashboard_search_results_content_items);
        return dashboard_search_results_content_items;
    };
})( jQuery );