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
                                if ($.inArray(configuration.actions[a].content_properties.added[cp].type, visualization.data_dimensions[d].type) > -1)
                                    supported_dimension_values++;
                    for (var b=0; b<configuration.data_points.length; b++)
                        if (configuration.data_points[b].configured && configuration.data_points[b].meta_data != null)
                            for (var ex=0; ex<configuration.data_points[b].meta_data.length; ex++)
                                if ($.inArray(configuration.data_points[b].meta_data[ex].type, visualization.data_dimensions[d].type) > -1)
                                    supported_dimension_values++;
                    if (supported_dimension_values == 0)
                        unconfigurable++;
                }
                return unconfigurable > 0;
            };

            var remove_click_function = function(event, container, visualization_id)
            {
                event.preventDefault();
                container.parents('.collection_container').dashboard_collection('remove_visualization', visualization_id);
                container.html('');
                //track_event('visualization', 'remove', visualization.name);
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
                        var type = container.find('option[value="' + value + '"]').data('type');
                        visualization.data_dimensions[x]['value'] = { value:value, name:name, type:type }
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
                visualization_container.append(visualization_html);
                visualization_container.find('.remove, .save').button();
                visualization_html.find('.remove').click(function(e) { remove_click_function(e, visualization_container, visualization.id); });
                return visualization_container;
            }
            else if (!visualization.configured)
            {
                var configuration = visualization_container.parents('.collection_container').data('configuration');
                var number_of_required_dimensions = (visualization.number_of_required_dimensions != null)
                    ? visualization.number_of_required_dimensions
                    : 1;

                for (var d=0; d<visualization.data_dimensions.length; d++)
                {
                    var dimension = visualization.data_dimensions[d];
                    if (dimension.values == null)
                        dimension.values = [];

                    if (d >= number_of_required_dimensions)
                        dimension.values[0] = { name:'None', value:null, type:null };

                    //Cycle through all the actions applied to this search widget looking for values that can be graphed
                    var dimension_types = dimension.type;
                    for (var a=0; a<configuration.actions.length; a++)
                        if (configuration.actions[a].content_properties.added != null)
                            for (var cp=0; cp<configuration.actions[a].content_properties.added.length; cp++)
                                if($.inArray(configuration.actions[a].content_properties.added[cp].type, dimension_types) > -1)
                                    dimension.values[dimension.values.length] = {
                                        name:configuration.actions[a].content_properties.added[cp].display_name,
                                        value:search_encode_property(
                                            configuration.actions[a].name,
                                            configuration.actions[a].content_properties.added[cp].name,
                                            configuration.actions[a].content_properties.added[cp].type
                                        ),
                                        type:configuration.actions[a].content_properties.added[cp].type
                                    };

                    //Cycle through all the data points in this search widget looking for values that can be graphed
                    for (var b=0; b<configuration.data_points.length; b++)
                        if (configuration.data_points[b].configured && configuration.data_points[b].meta_data != null)
                            for (var ex=0; ex<configuration.data_points[b].meta_data.length; ex++)
                                if ($.inArray(configuration.data_points[b].meta_data[ex].type, dimension_types) > -1)
                                    dimension.values[dimension.values.length] = {
                                        name:configuration.data_points[b].meta_data[ex].display_name,
                                        value:configuration.data_points[b].meta_data[ex].name,
                                        type:configuration.data_points[b].meta_data[ex].type
                                    };

                    //Dedupe any duplicate values
                    var un_duped_dimension_values = [];
                    for (var dv=0; dv<dimension.values.length; dv++) {
                        var should_be_added = true;
                        for (var ud=0; ud<un_duped_dimension_values.length; ud++)
                            if (dimension.values[dv].name == un_duped_dimension_values[ud].name)
                                should_be_added = false;
                        if (should_be_added == true)
                            un_duped_dimension_values[un_duped_dimension_values.length] = dimension.values[dv];
                    }
                    dimension.values = un_duped_dimension_values;
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
                visualization.export_link = '/i/s/470/250/' + $('.dashboard').data('dashboard').id + '/' + visualization.id + '.png?as_attachment=true'
                var visualization_html = $.tmpl('visualization_container', visualization);
                visualization_container.append(visualization_html);
                visualization_html.find('.loading').show();
                var configuration = visualization_container.parents('.collection_container').data('configuration');
                var timestamp = new Date;
                timestamp = timestamp.getTime();
                $.ajax({
                    async:true,
                    type:'POST',
                    url:'/dashboard/visualizations/run_visualization/' + timestamp,
                    data:{
                        visualization:JSON.stringify(visualization),
                        data_points:JSON.stringify(configuration.data_points),
                        search_filters:JSON.stringify(configuration.search_filters),
                        base_search_configuration:JSON.stringify(configuration.base_search_configuration),
                        csrfmiddlewaretoken:$('#csrf_form input').val()
                    },
                    dataType:'script',
                    success:function(data, textStatus, jqXHR){
                        var id_strings = /v_\w+/.exec(data);
                        if(id_strings.length > 0) {
                            var id = id_strings[0];
                            setTimeout(function(){
                                $('#' + id).parents('.visualization_container').find('.loading').hide();
                                $('#' + id).parents('.visualizations_container').dashboard_visualizations('capture_snapshots');
                            }, 1000);
                        }
                    }
                });
                visualization_html.find('.config').click(function(e) { configure_button_clicked(e, visualization_container, visualization.id); });
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
