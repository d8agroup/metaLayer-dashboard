/***********************************************************************************************************************
 DASHBOARD - dashboard_outputs
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_outputs = function(configuration)
    {
        var remove_output_function = function(event, container, output)
        {
            event.preventDefault();
            container.parents('.collection_container').dashboard_collection('remove_output', output.id);
            track_event('output', 'removed', output.name);
        };

        var dashboard_outputs_container = this;
        var outputs = configuration.outputs;
        for (var x=0; x<outputs.length; x++)
        {
            var output = outputs[x];
            var output_html = $.tmpl('output_url', output);
            output_html.find('.remove').click
                (
                    function(event) { remove_output_function(event, dashboard_outputs_container, output); }
                );
            dashboard_outputs_container.append(output_html);

        }
    };
})( jQuery );
