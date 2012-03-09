/***********************************************************************************************************************
 DASHBOARD - widgets panel - CHECKED 18/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(data)
        {
            var render_widgets_function = function(data, widget_panel)
            {
                var load_data_point_content_template = function(data)
                {
                    var template = data.template;
                    var template_name = 'dashboard_search_results_content_items_' + data.type + '_' + data.sub_type;
                    $.template(template_name, template);
                };

                var empty_widget_panel_html = $("<div class='widget_panel'><table><tr></tr></table></div>");

                var data_point_widgets_container_html = $('<td id="data_point_widgets_container"></td>');
                data_point_widgets_container_html.append('<h3>data points</h3>');
                var data_points = data.data_points;
                for (var x=0; x<data_points.length; x++)
                {
                    var data_point = data_points[x];
                    var data_point_html = $('<div class="data_point_widget"><span>' + data_point.display_name_short + '</span></div>');
                    data_point_html.data('data_point', data_point);
                    data_point_widgets_container_html.append(data_point_html);
                    data_point_html.corner();

                    //Also load the content item templates
                    var load_template_url = '/dashboard/data_points/get_content_item_template/' + data_point.type + '/' + data_point.sub_type;
                    $.get ( load_template_url, function(data) { load_data_point_content_template(data); } );
                }
                empty_widget_panel_html.find('tr').append(data_point_widgets_container_html);

                var action_widgets_container_html = $('<td id="action_widgets_container"></td>');
                action_widgets_container_html.append('<h3>actions</h3>');
                var actions = data.actions;
                for (var y=0; y<actions.length; y++)
                {
                    var action = actions[y];
                    var action_html = $("<div class='action_widget'><span>" + action.display_name_short + "</span></div>");
                    action_html.data('action', action);
                    action_widgets_container_html.append(action_html);
                    action_html.corner();
                }
                empty_widget_panel_html.find('tr').append(action_widgets_container_html);

                var output_widgets_container_html = $("<td id='output_widgets_container'></td>");
                output_widgets_container_html.append("<h3>outputs</h3>");
                var outputs = data.outputs;
                for (var z=0; z<outputs.length; z++)
                {
                    var output = outputs[z];
                    var output_html = $("<div class='output_widget'><span>" + output.display_name_short + "</span></div>");
                    output_html.data('output', output);
                    output_widgets_container_html.append(output_html);
                    output_html.corner();
                }
                empty_widget_panel_html.find('tr').append(output_widgets_container_html);

                var visualization_widgets_container_html = $("<td id='visualization_widgets_container'></td>");
                visualization_widgets_container_html.append("<h3>visualizations</h3>");
                var visualizations = data.visualizations;
                for (var v=0; v<visualizations.length; v++)
                {
                    var visualization = visualizations[v];
                    var visualization_html = $("<div class='visualization_widget'><span>" + visualization.display_name_short + "</span></div>");
                    visualization_html.data('visualization', visualization);
                    visualization_widgets_container_html.append(visualization_html);
                    visualization_html.corner();
                }
                visualization_widgets_container_html.append('<div class="spacer">&nbsp;</div>'); //This is because there is an odd number of viz's
                empty_widget_panel_html.find('tr').append(visualization_widgets_container_html);

                widget_panel.html(empty_widget_panel_html);
                widget_panel.dashboard_widget_panel('apply_widget_draggable');
            };

            var widget_panel = this;
            widget_panel.children().remove();
            $.get ( '/dashboard/widgets/get_all', function(data) { render_widgets_function(data, widget_panel) }, 'JSON' );
            widget_panel.corner();
            return widget_panel;
        },
        apply_widget_draggable:function()
        {
            var widget_panel = this;
            widget_panel.find('.data_point_widget').draggable( { revert:true, helper:"clone", stack:'.collection_container' });
            widget_panel.find('.action_widget').draggable( { revert:true, helper:"clone", stack:'.collection_container' });
            widget_panel.find('.output_widget').draggable( { revert:true, helper:"clone", stack:'.collection_container' });
            widget_panel.find('.visualization_widget').draggable( { revert:true, helper:"clone", stack:'.collection_container' });
            return widget_panel;
        }
    };

    $.fn.dashboard_widget_panel = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_widget_panel' );
    }
})( jQuery );