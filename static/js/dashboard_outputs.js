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
            var output_html = '';

            if (output.type == 'url') {
                output_html = $.tmpl('output_url', output);
            }
            else if (output.type == 'render') {
                output_html = $.tmpl('output_render', output);
                $.post
                    (
                        '/dashboard/outputs/get_render',
                        {
                            output:JSON.stringify(output),
                            search_results:JSON.stringify(configuration.search_results),
                            csrfmiddlewaretoken:$('#csrf_form input').val()
                        },
                        function(data) {
                            var id = data.output.id;
                            $('#o_' + id).html(data.output.html);
                            $('#o_' + id).find('.more_link').click(function(){
                                var link = $(this);
                                if (link.is('.open')) {
                                    link.html('more &#x25BC;');
                                    link.removeClass('open');
                                    link.parents('li').find('.more').hide()
                                }else {
                                    link.html('less &#x25B2;');
                                    link.addClass('open');
                                    link.parents('li').find('.more').show()
                                }
                            });
                        }
                    )
            }

            dashboard_outputs_container.append(output_html);
            output_html.find('.remove').click(function(event) {
                remove_output_function(event, dashboard_outputs_container, output);
            });
        }
    };
})( jQuery );
