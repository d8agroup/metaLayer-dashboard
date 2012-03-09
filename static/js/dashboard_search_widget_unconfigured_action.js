/***********************************************************************************************************************
 dashboard_search_widget_unconfigured_action
***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_unconfigured_action = function(action)
    {
        var cancel_button_click_function = function(event, container, action)
        {
            var action_id = action.id;
            event.preventDefault();
            container.parents('.search_widget').dashboard_search_widget('remove_action', action_id);
            track_event('action', 'removed', action.name);
        };
        var save_button_click_function = function(event, container, action)
        {
            var process_validate_results_function = function(data, container, action)
            {
                var passed = data.passed;
                if (passed)
                {
                    remove_waiting(container);
                    action['configured'] = true;
                    action['configured_display_name'] = data.configured_display_name;
                    $.post
                        (
                            '/dashboard/actions/add_action_to_data_points',
                            {
                                action:JSON.stringify(action),
                                data_points:JSON.stringify(container.parents('.collection_container').data('configuration').data_points),
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
                                "<p>Sorry, we couldn't save this action, please review the errors below</p>" +
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
            if (action.elements != null)
                for (var x=0; x < action.elements.length; x++)
                    action.elements[x]['value'] = container.find('.action_config form .form_row .' + action.elements[x].name).val();
            $.post
                (
                    '/dashboard/actions/validate',
                    { action:JSON.stringify(action), csrfmiddlewaretoken:$('#csrf_form input').val() },
                    function(data) { process_validate_results_function(data, container, action); },
                    'JSON'
                );
        };
        var dashboard_unconfigured_action = this;
        var unconfigured_action_html = $.tmpl('dashboard_unconfigured_action', action);
        unconfigured_action_html.find('.cancel').click
            (
                function(event) { cancel_button_click_function(event, dashboard_unconfigured_action, action); }
            );
        unconfigured_action_html.find('.save').click
            (
                function(event) { save_button_click_function(event, dashboard_unconfigured_action, action); }
            );
        dashboard_unconfigured_action.html(unconfigured_action_html);
        dashboard_unconfigured_action.find('.cancel, .save, .api_key_link').button();
        dashboard_unconfigured_action.find('.api_key_link').click
            (
                function()
                {
                    $('#api_key_manager').modal_api_key_manager();
                }
            );
        return dashboard_unconfigured_action
    }
})( jQuery );
