/***********************************************************************************************************************
 DASHBOARD - dashboard_visualization
 ***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(visualization)
        {
            var visualization_container = this;
            visualization_container.data('visualization', visualization);
            visualization_container.dashboard_visualization('render');
            return visualization_container;
        },
        render:function()
        {
            var visualization_is_unconfigurable = function(container, visualization)
            {
                var unconfigurable = 0;
                var configuration = container.parents('.collection_container').data('configuration');
                for (var d=0; d<visualization.data_dimensions.length; d++)
                {
                    if (visualization.data_dimensions[d].type == 'int')
                        return false;
                    var supported_dimension_values = 0;
                    for (var a=0; a<configuration.actions.length; a++)
                        if (configuration.actions[a].configured && configuration.actions[a].content_properties.added != null)
                            for (var cp=0; cp<configuration.actions[a].content_properties.added.length; cp++)
                                if (visualization.data_dimensions[d].type == configuration.actions[a].content_properties.added[cp].type)
                                    supported_dimension_values++
                    if (supported_dimension_values == 0)
                        unconfigurable++;
                }
                if (configuration.actions.length == 0)
                    return true;
                return unconfigurable > 0;
            };

            var remove_click_function = function(event, container, visualization)
            {
                event.preventDefault();
                container.parents('.collection_container').dashboard_collection('remove_visualization', visualization.id);
                container.remove();
                track_event('visualization', 'remove', visualization.name);
            };

            var save_button_clicked = function(event, container, visualization)
            {
                event.preventDefault();
                container.find('.errors').remove();
                if (visualization.elements != null)
                    for (var x=0; x<visualization.elements.length; x++)
                        visualization.elements[x]['value'] = container.find('.' + visualization.elements[x].name).val()
                if (visualization.data_dimensions != null)
                    for (var x=0; x<visualization.data_dimensions.length; x++)
                    {
                        var value = container.find('.' + visualization.data_dimensions[x].name).val();
                        var name = container.find('option[value="' + value + '"]').data('title');
                        visualization.data_dimensions[x]['value'] = { value:value, name:name }
                    }
                visualization.configured = true;
                var collection = container.parents('.collection_container');
                var configuration = collection.data('configuration');
                for (var x=0; x<configuration.visualizations.length; x++)
                    if (configuration.visualizations[x].id == visualization.id)
                        configuration.visualizations[x] = visualization;
                container.parents('.visualizations_container').dashboard_visualizations('render');
                collection.parents('.dashboard').dashboard('save');
            };

            var configure_button_clicked = function(event, container, visualization_id)
            {
                var configuration = container.parents('.collection_container').data('configuration');
                for (var x=0; x<configuration.visualizations.length; x++)
                    if (configuration.visualizations[x].id == visualization_id)
                        configuration.visualizations[x].configured = false;
                container.parents('.visualizations_container').dashboard_visualizations('render');
            };

            var visualization_container = this;
            var visualization = visualization_container.data('visualization');

            if (visualization_is_unconfigurable(visualization_container, visualization))
            {
                var visualization_html = $.tmpl('unconfigurable_visualization_container', visualization);
                visualization_html.find('.remove').click(function(e) { remove_click_function(e, visualization_container, visualization); });
                visualization_container.append(visualization_html);
                visualization_container.find('.remove, .save').button();
                return visualization_container;
            }
            else if (!visualization.configured)
            {
                var configuration = visualization_container.parents('.collection_container').data('configuration');
                for (var d=0; d<visualization.data_dimensions.length; d++)
                {
                    var dimension = visualization.data_dimensions[d];
                    dimension.values = [];
                    var dimension_type = dimension.type;
                    if (dimension_type == 'int')
                        dimension.values[dimension.values.length] = { name:'Total Count', value:'total_count' };
                    for (var a=0; a<configuration.actions.length; a++)
                        if (configuration.actions[a].content_properties.added != null)
                            for (var cp=0; cp<configuration.actions[a].content_properties.added.length; cp++)
                                if(configuration.actions[a].content_properties.added[cp].type == dimension_type)
                                    dimension.values[dimension.values.length] =
                                    {
                                        name:configuration.actions[a].content_properties.added[cp].display_name,
                                        value:search_encode_property
                                            (
                                                configuration.actions[a].name,
                                                configuration.actions[a].content_properties.added[cp].name,
                                                configuration.actions[a].content_properties.added[cp].type
                                            )
                                    };
                }
                var visualization_html = $.tmpl('unconfigured_visualization_container', visualization);
                visualization_html.find('.remove').click(function(e) { remove_click_function(e, visualization_container, visualization.id); });
                visualization_html.find('.save').click(function(e) { save_button_clicked(e, visualization_container, visualization); });
                visualization_container.append(visualization_html);
                visualization_container.find('.remove, .save').button();
                return visualization_container;
            }
            else
            {
                var visualization_html = $.tmpl('visualization_container', visualization);
                visualization_container.append(visualization_html);
                visualization_html.find('.loading').show();
                var configuration = visualization_container.parents('.collection_container').data('configuration');
                var timestamp = new Date;
                timestamp = timestamp.getTime();
                $.ajax
                    (
                        {
                            async:true,
                            type:'POST',
                            url:'/dashboard/visualizations/run_visualization/' + timestamp,
                            data:
                            {
                                visualization:JSON.stringify(visualization),
                                data_points:JSON.stringify(configuration.data_points),
                                search_filters:JSON.stringify(configuration.search_filters),
                                csrfmiddlewaretoken:$('#csrf_form input').val()
                            },
                            dataType:'script'
                        }
                    );
                visualization_html.find('.config').click(function(e) { configure_button_clicked(e, visualization_container, visualization.id); });
                setTimeout(function(){ visualization_html.find('.loading').hide() }, 5000);
                return visualization_container;
            }
        }
    };

    $.fn.dashboard_visualization = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_visualizations' );
    };

})( jQuery );
