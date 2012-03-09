/***********************************************************************************************************************
 DASHBOARD - dashboard_search_widget_data_points - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_search_widget_data_points_and_actions = function(data)
    {
        var data_point_clicked_function = function(link)
        {
            var data_point = link.data('data_point');
            data_point.configured = false;
            var post_data = { data_point:JSON.stringify(data_point), csrfmiddlewaretoken:$('#csrf_form input').val() };
            $.post('/dashboard/data_points/remove_data_point', post_data);
            link.parents('.search_widget').dashboard_search_widget('render');
        };

        var action_clicked_function = function(link)
        {
            var action = link.data('action');
            action.configured = false;
            var post_data = { action:JSON.stringify(action), csrfmiddlewaretoken:$('#csrf_form input').val() };
            $.post('/dashboard/actions/remove_action', post_data);
            link.parents('.search_widget').dashboard_search_widget('render');
        };

        var search_widgets_data_points = this;
        var data_points = data.data_points;
        var actions = data.actions;
        var data_points_and_actions_summary_html = $('<ul class="data_points_and_actions_summary"></ul>');
        for (var x=0; x<data_points.length; x++)
        {
            var data_point_html = $.tmpl('dashboard_search_widget_data_point', data_points[x]);
            data_point_html.find('a').data('data_point', data_points[x])
            data_point_html.find('a').click( function() { data_point_clicked_function($(this)); } );
            data_points_and_actions_summary_html.append( data_point_html );
        }
        if (actions.length > 0)
        {
            data_points_and_actions_summary_html.append('<li class="divider"><span>|</span></li>')
        }
        for (var y=0; y<actions.length; y++)
        {
            var action_html = $.tmpl('dashboard_search_widget_action', actions[y]);
            action_html.find('a').data('action', actions[y]);
            action_html.find('a').click( function() { action_clicked_function($(this)); } );
            data_points_and_actions_summary_html.append( action_html );
        }
        search_widgets_data_points.append(data_points_and_actions_summary_html);
        return search_widgets_data_points;
    };
})( jQuery );
