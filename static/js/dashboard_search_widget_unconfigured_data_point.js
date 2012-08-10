/***********************************************************************************************************************
 dashboard_unconfigured_data_point - CHECKED 19/01/2012
***********************************************************************************************************************/
(function( $ )
{
    var methods = {
        init:function(data_point){
            var dashboard_unconfigured_data_point = this;
            dashboard_unconfigured_data_point.data('data_point', data_point);

            //Check if this data point needs oauth support
            var oauth2_credentials = null;
            for (var x=0; x<data_point.elements.length; x++)
                if (data_point.elements[x].name == 'oauth2')
                    oauth2_credentials = data_point.elements[x].value;

            if (oauth2_credentials == null){
                return dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
            }
            else {
                dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render_waiting');
                $.post('/dashboard/data_points/oauth2/check_credentials',
                    { data_point:JSON.stringify(data_point), credentials:oauth2_credentials, csrfmiddlewaretoken:$('#csrf_form input').val() },
                    function(data){
                        var is_valid = data.credentials_are_valid;
                        var data_point_id = data.data_point_id;
                        var data_point_type = data.data_point_type;
                        if (!is_valid){
                            window.open('/dashboard/data_points/oauth2/authenticate?data_point_type=' + data_point_type + '&id=' + data_point_id);
                            setTimeout(function(){
                                $.post('/dashboard/data_points/oauth2/poll_for_new_credentials',
                                    { data_point:JSON.stringify(data_point), csrfmiddlewaretoken:$('#csrf_form input').val() },
                                    function(data){
                                        var enhanced_data_point = data.data_point;
                                        dashboard_unconfigured_data_point.data('data_point', enhanced_data_point);
                                        dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
//                                        var id = enhanced_data_point.id;
//                                        $('.collection_container').each(function(){
//                                            var configuration = $(this).data('configuration');
//                                            for(var x=0; x<configuration.data_points.length; x++)
//                                                if (configuration.data_points[x].id == id) {
//                                                    configuration.data_points[x] = enhanced_data_point;
//                                                    dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
//                                                }
//                                        });
                                    }
                                )
                            }, 1500);
                        }
                        else {
                            var enhanced_data_point = data.data_point;
                            dashboard_unconfigured_data_point.data('data_point', enhanced_data_point);
                            dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
//                            if (enhanced_data_point != null){
//                                var id = enhanced_data_point.id;
//                                $('.collection_container').each(function(){
//                                    var configuration = $(this).data('configuration');
//                                    for(var x=0; x<configuration.data_points.length; x++)
//                                        if (configuration.data_points[x].id == id) {
//                                            configuration.data_points[x] = enhanced_data_point;
//                                            dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
//                                        }
//                                });
//                            }
                        }
                    },
                    'JSON'
                );
            }
        },
        render:function(){
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
                    if (container.find('.data_point_config form .form_row .' + data_point.elements[x].name).length > 0)
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
            var data_point = dashboard_unconfigured_data_point.data('data_point');
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
            dashboard_unconfigured_data_point.find('.cancel, .save, .api_key_link, .file_upload_link').button();
            dashboard_unconfigured_data_point.find('.multiple_select').multiselect({
                selectedText: "# of # selected"
            });
            dashboard_unconfigured_data_point.find('select').not('.multiple_select').multiselect({
                multiple:false,
                selectedList:1
            });
            dashboard_unconfigured_data_point.find('.date_time').datepicker();
            dashboard_unconfigured_data_point.find('.api_key_link').click
                (
                    function()
                    {
                        $('#api_key_manager').modal_api_key_manager();
                    }
                );
            dashboard_unconfigured_data_point.find('.file_upload_link').click(function(){
                var data_point = $(this).parents('.data_point_config_container').data('data_point');
                $('#data_uploader').modal_data_uploader('open', {data_point:data_point});
            });
            return dashboard_unconfigured_data_point
        },
        render_waiting:function(){
            var dashboard_unconfigured_data_point = this;
            var data_point = dashboard_unconfigured_data_point.data('data_point');
            var unconfigured_data_point_html = $.tmpl('dashboard_unconfigured_data_point_waiting', data_point);
            dashboard_unconfigured_data_point.html(unconfigured_data_point_html);
            return this;
        }
    };

    $.fn.dashboard_unconfigured_data_point = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_unconfigured_data_point' );
    }
})( jQuery );
