/***********************************************************************************************************************
 DASHBOARD - dashboard_search_results_content_items - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_search_results_content_items = function(data)
    {
        var dashboard_search_results_content_items = this;
        var content_items = data.search_results.content_items;
        var search_actions = data.search_actions;
        for (var x=0; x<content_items.length; x++)
        {
            var template_name = 'dashboard_search_results_content_items_' + content_items[x]['channel_type'] + "_" + content_items[x]['channel_sub_type'];
            var content_template = $.tmpl(template_name, content_items[x]);
            content_template.appendTo(dashboard_search_results_content_items);
            for (var y=0; y<search_actions.length; y++)
            {
                var action_template_name = 'dashboard_search_results_action_' + search_actions[y].name;
                $.tmpl(action_template_name, content_items[x]).appendTo(content_template.find('.actions'));
            }
        }
        clean_user_generated_html(dashboard_search_results_content_items);
        apply_helper_class_functions(dashboard_search_results_content_items);
        return dashboard_search_results_content_items;
    };
})( jQuery );