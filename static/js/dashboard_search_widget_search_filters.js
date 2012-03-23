/***********************************************************************************************************************
 DASHBOARD - dashboard_search_widget_search_filters - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_search_widget_search_filters = function(data)
    {
        var search_filters_container = this;
        var search_results = data.search_results;
        var search_filters = data.search_filters;
        var base_search_configuration = data.base_search_configuration;
        var template_data = {
            keywords:search_results.keywords,
            pagination:search_results.pagination,
            items_shown:(search_results.pagination.total > search_results.pagination.pagesize)
                ? search_results.pagination.pagesize
                : search_results.pagination.total
        };
        search_filters_container.children().remove();
        search_filters_container.data('search_results', search_results);
        search_filters_container.data('search_filters', search_filters);
        $.tmpl('dashboard_search_widget_search_filters', template_data).appendTo(search_filters_container);
        search_filters_container.find('.keywords_container').corner();
        search_filters_container.find('.button').button();

        var search_filter_start_time = search_filters.time.split('%20TO%20')[0].replace('[', '');
        search_filter_start_time = (search_filter_start_time == '*') 
            ? ((new Date().valueOf() * 0.001)|0) - 7200
            : parseInt(search_filter_start_time);
        var search_filter_end_time = search_filters.time.split('%20TO%20')[1].replace(']', '');
        search_filter_end_time = (search_filter_end_time == '*')
            ? ((new Date().valueOf() * 0.001)|0)
            : parseInt(search_filter_end_time);
        
        var base_search_start_time = (base_search_configuration.search_start_time == '*')
            ? ((new Date().valueOf() * 0.001)|0) - 7200
            : parseInt(base_search_configuration.search_start_time);
        var base_search_end_time = (base_search_configuration.search_end_time == '*')
            ? ((new Date().valueOf() * 0.001)|0)
            : parseInt(base_search_configuration.search_end_time);

        search_filters_container.find('.daterange .range').html(display_time2(search_filter_start_time) + ' to ' + ((search_filter_end_time == base_search_end_time) ? 'Now' : display_time2(search_filter_end_time)));
        search_filters_container.find('.daterange .slider').slider
            (
                {
                    range:true,
                    min:base_search_start_time,
                    max:base_search_end_time,
                    values:[search_filter_start_time,search_filter_end_time],
                    slide:function(event, ui)
                    {
                        var start = ui.values[0];
                        var end = ui.values[1];
                        $(ui.handle).parents('.collection_container').find('.daterange .range').html(display_time2(start) + ' to ' + ((end == base_search_end_time) ? 'Now' : display_time2(end)));
                    }
                }
            );
        search_filters_container.find('a.save').click
            (
                function()
                {
                    search_filters_container.data('search_filters')['keywords'] = search_filters_container.find('.keywords input').val();
                    var slider_min_value = search_filters_container.find('.daterange .slider').slider('values', 0);
                    var start_time = (slider_min_value == base_search_start_time)
                        ? base_search_configuration.search_start_time
                        : slider_min_value;
                    var slider_max_value = search_filters_container.find('.daterange .slider').slider('values', 1);
                    var end_time = (slider_max_value == base_search_end_time)
                        ? base_search_configuration.search_end_time
                        : slider_max_value;
                    search_filters_container.data('search_filters')['time'] = '[' + start_time + '%20TO%20' + end_time + ']';
                    search_filters_container.parents('.collection_container').dashboard_collection('render');
                }
            );
        search_filters_container.find('a.remove_keyword_filter').click
            (
                function()
                {
                    $(this).parents('.keywords').find('input').val('');
                }
            );
        return this
    }
})( jQuery );
