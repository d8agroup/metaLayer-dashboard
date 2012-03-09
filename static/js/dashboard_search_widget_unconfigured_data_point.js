/***********************************************************************************************************************
 dashboard_unconfigured_data_point - CHECKED 19/01/2012
***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_unconfigured_data_point = function(data_point)
    {
        var cancel_button_click_function = function(event, container, data_point)
        {
            var data_point_id = data_point.id;
            event.preventDefault();
            container.parents('.search_widget').dashboard_search_widget('remove_data_point', data_point_id);
            track_event('data_point', 'removed', data_point.type);
        };
        var save_button_click_function = function(event, container, data_point)
        {
            var process_validate_results_function = function(data, container, data_point)
            {
                var passed = data.passed;
                if (passed)
                {
                    remove_waiting(container);
                    data_point['configured'] = true;
                    data_point['configured_display_name'] = data.configured_display_name;
                    var actions = container.parents('.collection_container').data('configuration').actions;
                    $.post
                        (
                            '/dashboard/data_points/add_data_point_with_actions',
                            {
                                data_point:JSON.stringify(data_point),
                                actions:JSON.stringify(actions),
                                csrfmiddlewaretoken:$('#csrf_form input').val()
                            }
                        );
                    container.parents('.search_widget').dashboard_search_widget('render');

                }
                else
                {
                    container.find('.instructions').before
                        (
                            "<div class='alert errors'>" +
                                "<p>Sorry, we couldn't save this data point, please review the errors below</p>" +
                            "</div>"
                        );
                    for (var error_group in data.errors)
                    {
                        var error_html = $("<div class='errors alert'></div>");
                        for (var x=0; x<data.errors[error_group].length; x++)
                            error_html.append("<p>" + data.errors[error_group][x] + "</p>");
                        container.find('.form_row .' + error_group).parents('.form_row').prepend(error_html);
                    }
                    remove_waiting(container);
                }
            };

            apply_waiting(container, 'Validating');
            event.preventDefault();
            container.find('.errors').remove();
            for (var x=0; x < data_point.elements.length; x++)
                data_point.elements[x]['value'] = container.find('.data_point_config form .form_row .' + data_point.elements[x].name).val();
            $.post
                (
                    '/dashboard/data_points/validate',
                    { data_point:JSON.stringify(data_point), csrfmiddlewaretoken:$('#csrf_form input').val() },
                    function(data) { process_validate_results_function(data, container, data_point); },
                    'JSON'
                );
        };
        var dashboard_unconfigured_data_point = this;
        var unconfigured_data_point_html = $.tmpl('dashboard_unconfigured_data_point', data_point);
        unconfigured_data_point_html.find('.cancel').click
            (
                function(event) { cancel_button_click_function(event, dashboard_unconfigured_data_point, data_point); }
            );
        unconfigured_data_point_html.find('.save').click
            (
                function(event) { save_button_click_function(event, dashboard_unconfigured_data_point, data_point); }
            );
        dashboard_unconfigured_data_point.html(unconfigured_data_point_html);
        dashboard_unconfigured_data_point.find('.cancel, .save, .api_key_link').button();
        dashboard_unconfigured_data_point.find('.api_key_link').click
            (
                function()
                {
                    $('#api_key_manager').modal_api_key_manager();
                }
            );
        return dashboard_unconfigured_data_point
    }
})( jQuery );
