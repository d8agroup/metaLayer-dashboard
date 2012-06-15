/***********************************************************************************************************************
 dashboard_collection - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(data)
        {
            var dashboard_collection = this;
            var collection = data.collection;
            if (collection.options == null)
                collection.options = {};
            if (collection.search_filters == null)
                collection.search_filters = {};
            if (collection.search_results == null)
                collection.search_results = {};
            if (collection.data_points == null)
                collection.data_points = [];
            if (collection.actions == null)
                collection.actions = [];
            if (collection.outputs == null)
                collection.outputs = [];
            if (collection.visualizations == null)
                collection.visualizations = [];
            if (collection.base_search_configuration == null)
                collection.base_search_configuration = {};
            dashboard_collection.data('configuration', collection);
            return dashboard_collection;
        },
        render:function()
        {
            var dashboard_collection = this;
            var configuration = dashboard_collection.data('configuration');
            if (configuration.data_points.length == 0)
            {
                var empty_collection_html = "<div class='empty_collection data_point_droppable'><p>Drag & Drop Data</p></div>";
                dashboard_collection.html(empty_collection_html);
            }
            else
            {
                var search_widget_html = $("<div class='search_widget data_point_droppable action_droppable output_droppable'></div>");
                dashboard_collection.html(search_widget_html);
                search_widget_html.dashboard_search_widget(configuration);

                var visualizations_container_html = $('<div class="visualizations_container"></div>');
                dashboard_collection.append(visualizations_container_html);
                visualizations_container_html.dashboard_visualizations(configuration);

                var outputs_container_html = $("<div class='outputs_container'></div>");
                dashboard_collection.append(outputs_container_html);
                outputs_container_html.dashboard_outputs(configuration);

                dashboard_collection.draggable( { revert:true, stack:'.collection_container', handle:'.data_points_and_actions_container' } );
            }
            dashboard_collection.dashboard_collection('apply_dashboard_collection_droppable');
            dashboard_collection.dashboard_collection('apply_widget_droppable');
            dashboard_collection.parents('.dashboard').dashboard('save');
            return dashboard_collection;
        },
        remove:function()
        {
            var dashboard_collection = this;
            var configuration = dashboard_collection.data('configuration');
            configuration.options = {};
            configuration.search_filters = {};
            configuration.search_results = {};
            configuration.data_points = [];
            configuration.actions = [];
            configuration.visualizations = [];
            configuration.base_search_configuration = {};
            for (var o=0; o<configuration.outputs.length; o++)
                $.post( '/dashboard/outputs/remove_output', { output:JSON.stringify(configuration.outputs[o]), csrfmiddlewaretoken:$('#csrf_form input').val() } );
            configuration.outputs = [];
            dashboard_collection.dashboard_collection('render');
            track_event('collection', 'removed', null);
            return dashboard_collection;
        },
        apply_widget_droppable:function()
        {
            var data_point_dropped_function = function(event, ui, configuration, collection)
            {
                var draggable = ui.draggable;
                var data_point = clone(draggable.data('data_point'));
                data_point['id'] = guid();
                if (configuration.data_points == null)
                {
                    configuration['data_points'] = [];
                    track_event('collection', 'started', null);
                }
                configuration.data_points[configuration.data_points.length] = data_point;
                collection.data('configuration', configuration);
                collection.dashboard_collection('render');
                track_event('data_point', 'added', data_point.type);
            };

            var dropped_function = function(event, ui, configuration, collection)
            {
                var action_dropped_function = function(event, ui, configuration, collection)
                {
                    var draggable = ui.draggable;
                    var action = clone(draggable.data('action'));
                    action['id'] = guid();
                    if (configuration.actions == null)
                        configuration.actions = [];
                    configuration.actions[configuration.actions.length] = action;
                    if (action.elements.length == 1 && action.elements[0].type == 'api_key')
                    {
                        var api_key = access_api_key_store_value(action.name);
                        if (api_key > '')
                        {
                            action.elements[0].value = api_key;
                            action.configured = true;
                        }
                    }
                    if (action.configured)
                    {
                        $.post
                            (
                                '/dashboard/actions/add_action_to_data_points',
                                {
                                    action:JSON.stringify(action),
                                    data_points:JSON.stringify(configuration.data_points),
                                    csrfmiddlewaretoken:$('#csrf_form input').val()
                                },
                                function() {
                                    collection.dashboard_collection('render');
                                }
                            );
                    }

                    collection.data('configuration', configuration);
                    collection.dashboard_collection('render');
                    track_event('action', 'added', action.name);
                };

                var output_dropped_function = function(event, ui, configuration, collection)
                {
                    var process_get_url_function = function(data, configuration, collection)
                    {
                        var output = data.output;
                        if (configuration.outputs == null)
                            configuration.outputs = [];
                        configuration.outputs[configuration.outputs.length] = output;
                        collection.data('configuration', configuration);
                        collection.dashboard_collection('render');
                    };

                    var process_get_render_function = function(data, configuration, collection)
                    {
                        var output = data.output;
                        if (configuration.outputs == null)
                            configuration.outputs = [];
                        configuration.outputs[configuration.outputs.length] = output;
                        collection.data('configuration', configuration);
                        collection.dashboard_collection('render');
                    };

                    var draggable = ui.draggable;
                    var output = clone(draggable.data('output'));
                    output['id'] = guid();
                    output['collection_id'] = configuration.id;
                    output['dashboard_id'] = collection.parents('.dashboard').data('dashboard').id;
                    if (output.type == 'url') {
                        $.post
                            (
                                '/dashboard/outputs/get_url',
                                { output:JSON.stringify(output), csrfmiddlewaretoken:$('#csrf_form input').val()},
                                function(data) { process_get_url_function(data, configuration, collection); }
                            );
                    }
                    else if (output.type == 'render') {
                        $.post
                            (
                                '/dashboard/outputs/get_render',
                                {
                                    output:JSON.stringify(output),
                                    csrfmiddlewaretoken:$('#csrf_form input').val()
                                },
                                function(data) { process_get_render_function(data, configuration, collection); }
                            )
                    }
                    track_event('output', 'added', output.name);
                };

                var visualization_dropped_function = function(event, ui, configuration, collection)
                {
                    var draggable = ui.draggable;
                    var visualization = clone(draggable.data('visualization'));
                    visualization['id'] = guid();
                    if (configuration.visualizations == null)
                        configuration.visualizations = [];
                    configuration.visualizations[configuration.visualizations.length] = visualization;
                    collection.data('configuration', configuration);
                    collection.find('.visualizations_container').dashboard_visualizations(configuration);
                    collection.parents('.dashboard').dashboard('save');
                    track_event('visualization', 'added', visualization.name);
                };

                if (ui.draggable.is('.data_point_widget'))
                    data_point_dropped_function(event, ui, configuration, collection);
                else if (ui.draggable.is('.action_widget'))
                    action_dropped_function(event, ui, configuration, collection);
                else if (ui.draggable.is('.output_widget'))
                    output_dropped_function(event, ui, configuration, collection);
                else if (ui.draggable.is('.visualization_widget'))
                    visualization_dropped_function(event, ui, configuration, collection);
            };

            var collection = this;
            var configuration = collection.data('configuration');
            collection.find('.search_widget').droppable
                (
                    {
                        accept:'.output_widget, .action_widget, .data_point_widget, .visualization_widget',
                        drop:function(event, ui) { dropped_function(event, ui, configuration, collection); }
                    }
                );
            collection.find('.empty_collection').droppable
                (
                    {
                        accept:'.data_point_widget',
                        drop:function(event, ui) { data_point_dropped_function(event, ui, configuration, collection); }
                    }
                );
            return this;
        },
        apply_dashboard_collection_droppable:function()
        {
            var collection_dropped_function = function(event, ui, collection, configuration)
            {
                var dragged_collection = ui.draggable;
                var dragged_configuration = dragged_collection.data('configuration');
                if (dragged_configuration.data_points.length == 0)
                    return;
                for (var x=0; x<dragged_configuration.data_points.length; x++)
                    configuration.data_points[configuration.data_points.length] = dragged_configuration.data_points[x];
                $(dragged_collection).dashboard_collection('remove');
                collection.dashboard_collection('render');
                track_event('collection', 'moved', null);
            };

            var collection = this;
            var configuration = collection.data('configuration');
            collection.droppable
                (
                    {
                        accept:'.collection_container',
                        drop:function(event, ui) { collection_dropped_function(event, ui, collection, configuration); }
                    }
                );
        },
        remove_output:function(output_id)
        {
            var collection = this;
            var configuration = collection.data('configuration');
            var new_outputs = [];
            for (var x=0; x<configuration.outputs.length; x++)
                if (configuration.outputs[x].id != output_id)
                    new_outputs[new_outputs.length] = configuration.outputs[x];
                else
                    $.post
                        (
                            '/dashboard/outputs/remove_output',
                            { output:JSON.stringify(configuration.outputs[x]), csrfmiddlewaretoken:$('#csrf_form input').val() }
                        );
            collection.data('configuration').outputs = new_outputs;
            collection.dashboard_collection('render');

            return collection;
        },
        remove_visualization:function(visualization_id)
        {
            var collection = this;
            var configuration = collection.data('configuration');
            var new_visualizations = [];
            for (var x=0; x<configuration.visualizations.length; x++)
                if (configuration.visualizations[x].id != visualization_id)
                    new_visualizations[new_visualizations.length] = configuration.visualizations[x];
                else
                    $.post
                        (
                            '/dashboard/visualizations/remove_visualization',
                            { visualization:JSON.stringify(configuration.visualizations[x]), csrfmiddlewaretoken:$('#csrf_form input').val() }
                        );
            collection.data('configuration').visualizations = new_visualizations;
            collection.find('.visualizations_container').dashboard_visualizations(configuration);
            collection.parents('.dashboard').dashboard('save');
            return collection;
        },
        search_results_updated:function()
        {
            var collection = this;
            var configuration = collection.data('configuration');
            collection.find('.visualizations_container').dashboard_visualizations('capture_snapshots');
            collection.find('.visualizations_container').dashboard_visualizations('update');
            collection.find('.outputs_container').dashboard_outputs(configuration);
        },
        apply_search_filter:function(data) {
            var container = this;
            container.find('.search_widget').dashboard_search_widget('apply_search_filter', data);
            return container;
        },
        reset_search_filters:function(){
            var dashboard_collection = this;
            var configuration = dashboard_collection.data('configuration');
            configuration.search_filters = {
                keywords:'',
                time:'[' + configuration.base_search_configuration.search_start_time + '%20TO%20' + configuration.base_search_configuration.search_end_time + ']'
            };
            dashboard_collection.dashboard_collection('render');
        }
    };

    $.fn.dashboard_collection = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_collection' );
    }
})( jQuery );