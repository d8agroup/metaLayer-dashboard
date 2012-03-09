/***********************************************************************************************************************
 user_dashboard_management_saved_dashboards
 ***********************************************************************************************************************/
(function ( $ )
{
    $.fn.user_dashboard_management_saved_dashboards = function(data)
    {
        /*** START Embedded functions ***/
        var delete_dashboard_link_click = function(event, element)
        {
            var saved_dashboard_container = element.parents('.saved_dashboard');
            var dashboard_id = saved_dashboard_container.data('dashboard_id');
            $.get('/user/dashboard_management/delete_dashboard?dashboard_id=' + dashboard_id);
            $('#user_dashboard_management_container').user_dashboard_management();
        };
        var dashboard_template_dropped = function(event, ui)
        {
            var dashboard_template_id = ui.draggable.data('template_id');
            $.get('/user/dashboard_management/new_dashboard_from_template/' + dashboard_template_id);
            $('#user_dashboard_management_container').user_dashboard_management();
            setTimeout(function() { ui.draggable.remove(); }, 1);
        };
        /*** END Embedded functions ***/

        var user_dashboard_management_saved_dashboards_container = this;
        var maximum_number_of_saved_dashboards = data.maximum_number_of_saved_dashboards;
        var saved_dashboards = data.saved_dashboards;
        var template_data = { dashboards:[], number_of_dashboards:maximum_number_of_saved_dashboards };
        for (var x=0; x<maximum_number_of_saved_dashboards; x++)
            template_data.dashboards[template_data.dashboards.length] = { dashboard:(x < saved_dashboards.length) ? saved_dashboards[x] : null };

        user_dashboard_management_saved_dashboards_container.html
            (
                $.tmpl('user_dashboard_management_saved_dashboards', template_data)
            );
        user_dashboard_management_saved_dashboards_container.find('.empty_saved_dashboard').droppable
            (
                {
                    accept:'.dashboard_template_image',
                    drop:function(event, ui) { dashboard_template_dropped(event, ui); }
                }
            );
        user_dashboard_management_saved_dashboards_container.find('.close_button_container a').click
            (
                function(event) { delete_dashboard_link_click(event, $(this)); }
            );
    }
})( jQuery );