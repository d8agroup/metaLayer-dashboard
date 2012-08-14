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
                //update the oauth2 credentials store
                var data_point_type = data_point.type;
                var oauth2_credentials_store = $('#oauth2_credentials_store').data('store');
                if (oauth2_credentials_store == null || oauth2_credentials_store == '')
                    oauth2_credentials_store = { data_points: {} };
                if (oauth2_credentials_store.data_points[data_point_type] == null)
                    oauth2_credentials_store.data_points[data_point_type] = oauth2_credentials;
                else
                    for (var x=0; x<data_point.elements.length; x++)
                        if (data_point.elements[x].name == 'oauth2')
                            data_point.elements[x].value = oauth2_credentials_store.data_points[data_point_type]

                $('#oauth2_credentials_store').data('store', oauth2_credentials_store);

                $.post('/dashboard/data_points/oauth2/persist_store',
                    { oauth_credentials_store:JSON.stringify(oauth2_credentials_store),
                        csrfmiddlewaretoken:$('#csrf_form input').val() });

                var oauth_credentials = '';
                for (var x=0; x<data_point.elements.length; x++)
                    if (data_point.elements[x].name == 'oauth2')
                        oauth2_credentials = data_point.elements[x].value;


                dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render_waiting', { message: 'Waiting for authorization'});
                $.post('/dashboard/data_points/oauth2/check_credentials',
                    {
                        data_point:JSON.stringify(data_point),
                        credentials:oauth2_credentials, //oauth2_credentials_store.data_points[data_point_type],
                        csrfmiddlewaretoken:$('#csrf_form input').val()
                    },
                    function(data){
                        var is_valid = data.credentials_are_valid;
                        var data_point_id = data.data_point_id;
                        var data_point_type = data.data_point_type;
                        if (!is_valid){
                            //window.open('/dashboard/data_points/oauth2/authenticate?data_point_type=' + data_point_type + '&id=' + data_point_id);
                            var authorization_url = '/dashboard/data_points/oauth2/authenticate?data_point_type=' + data_point_type + '&id=' + data_point_id;
                            dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render_oauth_authenticate', authorization_url);
                        }
                        else {
                            var enhanced_data_point = data.data_point;
                            dashboard_unconfigured_data_point.data('data_point', enhanced_data_point);
                            dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
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
                        var updated_data_point = data.updated_data_point;
                        data_point['configured'] = true;
                        data_point['configured_display_name'] = data.configured_display_name;
                        data_point.elements = updated_data_point.elements;
                        data_point.meta_data = updated_data_point.meta_data;

                        var data_points = container.parents('.search_widget').data('configuration').data_points;
                        for (var x=0; x<data_points.length; x++)
                            if (data_points[x].id == data_point.id)
                                data_points[x] = data_point;
                        var actions = container.parents('.collection_container').data('configuration').actions;
                        $.post('/dashboard/data_points/add_data_point_with_actions',{
                            data_point:JSON.stringify(data_point),
                            actions:JSON.stringify(actions),
                            csrfmiddlewaretoken:$('#csrf_form input').val()},
                            function(){
                                setTimeout(function(){container.parents('.search_widget').dashboard_search_widget('render');}, 1000);
                            });
                        container.dashboard_unconfigured_data_point('render_waiting', { message:'Waiting for results' });
                    }
                    else
                    {
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
            var data_point_with_mapped_option_groups = map_option_groups(data_point);
            var unconfigured_data_point_html = $.tmpl('dashboard_unconfigured_data_point', data_point_with_mapped_option_groups);
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
        render_waiting:function(data){
            var dashboard_unconfigured_data_point = this;
            var data_point = dashboard_unconfigured_data_point.data('data_point');
            var message = data.message;
            var unconfigured_data_point_html = $.tmpl('dashboard_unconfigured_data_point_waiting', { data_point:data_point, message:message});
            dashboard_unconfigured_data_point.html(unconfigured_data_point_html);
            return this;
        },
        render_oauth_authenticate:function(authorization_url){
            var poll_for_credentials = function(data_point){
                $.post('/dashboard/data_points/oauth2/poll_for_new_credentials',
                    { data_point:JSON.stringify(data_point), csrfmiddlewaretoken:$('#csrf_form input').val() },
                    function(data){
                        var enhanced_data_point = data.data_point;

                        if (enhanced_data_point == null) {
                            setTimeout(function() {poll_for_credentials(data_point) }, 1000);
                        }
                        else {
                            //store the correct credentials in the store
                            var oauth2_credentials = null;
                            for (var x=0; x<enhanced_data_point.elements.length; x++)
                                if (enhanced_data_point.elements[x].name == 'oauth2')
                                    oauth2_credentials = enhanced_data_point.elements[x].value;
                            $('#oauth2_credentials_store').data('store').data_points[enhanced_data_point.type] = oauth2_credentials;

                            dashboard_unconfigured_data_point.data('data_point', enhanced_data_point);
                            dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render');
                        }
                    }
                );
            };

            var dashboard_unconfigured_data_point = this;
            var data_point = dashboard_unconfigured_data_point.data('data_point');
            var unconfigured_data_point_html = $.tmpl('dashboard_unconfigured_data_point_oauth', {data_point:data_point, authorization_url:authorization_url});
            dashboard_unconfigured_data_point.html(unconfigured_data_point_html);
            dashboard_unconfigured_data_point.find('.button').button().click(function(){
                dashboard_unconfigured_data_point.dashboard_unconfigured_data_point('render_waiting', { message: 'Waiting for authorization'});
                poll_for_credentials(data_point);
            });

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
