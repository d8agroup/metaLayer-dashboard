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

        if (typeof(configuration) === 'undefined')
            return;

        var dashboard_outputs_container = this;
        dashboard_outputs_container.children().remove();
        if (configuration.search_results.pagination)
            var export_count = configuration.search_results.pagination.total;

        var outputs = configuration.outputs;

        if (outputs == null)
            return;

        for (var x=0; x<outputs.length; x++)
        {
            var output = outputs[x];
            output['export_count'] = export_count;
            var output_html = '';

            if (output.type == 'url') {
                output_html = $.tmpl('output_url', output);
            }
            else if (output.type == 'render') {
                output.html = '<div class="loading">Waiting for data <img src="/static/images/thedashboard/loading_circle.gif" />';
                output_html = $.tmpl('output_render', output);
                $.post
                    (
                        '/dashboard/outputs/get_render',
                        {
                            output:JSON.stringify(output),
                            search_results:JSON.stringify({facet_groups:configuration.search_results.facet_groups, pagination:configuration.search_results.pagination, stats:configuration.search_results.stats}),
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

            if (output.hasOwnProperty('modal') && output.modal == true) {
                // At least one visualization is required to create a report
                if (configuration.visualizations.length < 1) {
                    return;
                }
                if ($('#output_report').is(':hidden')) {
                    $('#output_report').modal_output_report('open', {
                        output: output,
                        container: dashboard_outputs_container,
                        remove_callback: remove_output_function
                    });
                }
            } else {
                dashboard_outputs_container.append(output_html);
                output_html.find('.remove').click(function(event) {
                    remove_output_function(event, dashboard_outputs_container, output);
                });
            }
        }
    };
})( jQuery );
