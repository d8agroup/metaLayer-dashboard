/***********************************************************************************************************************
 DASHBOARD - dashboard_search_widget_search_filters - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    var methods = {
        init:function(data){

            var container = this;
            container.dashboard_search_widget_search_filters('render_full_display', data);

        },
        render_full_display:function(data) {
            var search_filters_container = this;
            var search_results = data.search_results;
            var search_filters = data.search_filters;
            var base_search_configuration = data.base_search_configuration;


            for (var x=0; x<search_results.facet_groups.length; x++)
            {
                var facet_group_name = search_results.facet_groups[x].name;
                if (search_filters[facet_group_name] == null || search_filters[facet_group_name] == '')
                    continue;
                var facet_values = search_filters[facet_group_name].split('%20AND%20');
                search_results.facet_groups[x].facets.sort(function(facet_one, facet_two){
                    var facet_one_selected = $.inArray(facet_one.name, facet_values);
                    var facet_two_selected = $.inArray(facet_two.name, facet_values);
                    if ((facet_one_selected && facet_two_selected) || (!facet_one_selected && !facet_two_selected))
                        return 0;
                    if (facet_one_selected)
                        return 1;
                    return -1
                });
            }

            var active_search_filters = [];
            if (data.search_filters != null) {

                //Check if time is active
                var time_parts = (data.search_filters.time != null) ? data.search_filters.time.split('%20TO%20') : null;
                if (time_parts != null && time_parts.length == 2) {
                    var base_start_time = data.base_search_configuration.search_start_time;
                    var base_end_time = data.base_search_configuration.search_end_time;
                    var start_time = time_parts[0].replace('[', '');
                    var end_time = time_parts[1].replace(']', '');
                    if (base_start_time != start_time || base_end_time != end_time){
                        var display_start_time = (start_time == '*') ? 'Historic' : display_time2(parseInt(start_time));
                        var display_end_time = (end_time == '*') ? 'Now' : display_time2(parseInt(end_time));
                        active_search_filters.push({
                            name:'time',
                            display_name:'Time',
                            value:display_start_time + " to " + display_end_time
                        });
                    }
                }

                //Check if keywords are active
                if (data.search_filters.keywords > '') {
                    active_search_filters.push({
                        name:'keywords',
                        display_name:'Keywords',
                        value:data.search_filters.keywords
                    });
                }

                //Check action filters
                for (var filter in data.search_filters) {
                    if (filter.indexOf('action_') === 0) {
                        var filter_name_parts = filter.split('_');
                        if (filter_name_parts.length != 4)
                            continue;

                        var filter_name = filter_name_parts[2];
                        var filter_value = data.search_filters[filter];
                        if (filter_value == null || filter_value == '')
                            continue;
                        active_search_filters.push({
                            name:filter_name,
                            display_name:filter_name,
                            value:filter_value.replace(/%20AND%20/g, ' <span class="and">and</span> ')
                        });
                    }
                }
            }

            var template_data = {
                keywords:search_results.keywords,
                pagination:search_results.pagination,
                facet_groups:search_results.facet_groups,
                active_search_filters:active_search_filters,
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

            var simple_action_filters = search_filters_container.find('.action_filter');
            for (var x=0; x<simple_action_filters.length; x++) {
                var facet_name = $(simple_action_filters[x]).data('facet_name');
                if (search_filters[facet_name] == null || search_filters[facet_name] == '')
                    continue;
                var facet_values = search_filters[facet_name].split('%20AND%20');
                $(simple_action_filters[x]).data('facet_values', facet_values);
                $(simple_action_filters[x]).find('.simple_facet_link.all').removeClass('selected');
                $(simple_action_filters[x]).find('a.simple_facet_link:not(.all)').each(function(){
                    var link = $(this);
                    if ($.inArray(link.data('facet_value'), facet_values) > -1){
                        link.addClass('selected');
                    }
                })
            }

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

                        var simple_action_filters = search_filters_container.find('.action_filter');
                        for (var x=0; x<simple_action_filters.length; x++) {
                            var facet_values = [];
                            var selected_facet_values = $(simple_action_filters[x]).data('facet_values');
                            for (var y=0; y<selected_facet_values.length; y++)
                                if (selected_facet_values[y] !== undefined)
                                    facet_values.push(selected_facet_values[y]);
                            if (selected_facet_values.length == 0)
                                continue;
                            var facet_value_string = facet_values.join('%20AND%20');
                            var facet_name = $(simple_action_filters[x]).data('facet_name');
                            search_filters_container.data('search_filters')[facet_name] = facet_value_string;
                        }

                        search_filters_container.parents('.collection_container').dashboard_collection('render');
                    }
                );

            search_filters_container.find('a.close').click(function(){
                search_filters_container.find('.search_filters_controls').slideUp();
                search_filters_container.find('.search_filters_summary').slideDown();
            });

            search_filters_container.find('a.remove_keyword_filter').click
                (
                    function()
                    {
                        $(this).parents('.keywords').find('input').val('');
                    }
                );

            search_filters_container.find('a.simple_facet_link.all').click(function(event){
                var link = $(this);
                if (!link.is('.selected')) {
                    link.parents('ul.simple_facet_links').find('.simple_facet_link:not(.all)').removeClass('selected');
                    link.parents('li.action_filter').data('facet_values').length = 0;
                }
            });

            search_filters_container.find('a.simple_facet_link').click(function(event){
                var link = $(this);
                var this_facet_value = link.data('facet_value');
                if (link.is('.selected')) {
                    link.removeClass('selected');
                    if (link.parents('ul.simple_facet_links').find('a.simple_facet_link.selected').length == 0){
                        link.parents('ul.simple_facet_links').find('a.simple_facet_link.all').click();
                    }
                    else {
                        var new_facet_values_array = [];
                        var existing_facet_values_array = link.parents('li.action_filter').data('facet_values');
                        for (var x=0; x<existing_facet_values_array.length; x++)
                            if (existing_facet_values_array[x] != this_facet_value)
                                new_facet_values_array.push(existing_facet_values_array[x]);
                        link.parents('li.action_filter').data('facet_values', new_facet_values_array);
                    }
                }
                else {
                    link.parents('ul.simple_facet_links').find('a.simple_facet_link.all').removeClass('selected');
                    link.addClass('selected');
                    link.parents('li.action_filter').data('facet_values').push(this_facet_value);
                }
            });

            search_filters_container.find('a.more_link').click(function(){
                $(this).parents('ul.simple_facet_links').find('li.more').not('.zero').css('display', 'inline-block');
                $(this).hide();
            });
            search_filters_container.find('a.less_link').click(function(){
                $(this).parents('ul.simple_facet_links').find('li.more').hide();
                $(this).parents('ul.simple_facet_links').find('a.more_link').css('display', 'inline-block');
            });

            search_filters_container.find('.search_filters_summary a.open').click(function(){
                search_filters_container.find('.search_filters_controls').slideDown();
                search_filters_container.find('.search_filters_summary').slideUp();
            });

            search_filters_container.find('a.clear').click(function(){
                search_filters_container.parents('.collection_container').dashboard_collection('reset_search_filters');
            });

            return this
        },
        apply_search_filter:function(data){
            var container = this;
            var filter_name = data.filter_name;
            var filter_value = data.filter_value;
            var all_action_filters = container.find('.action_filter');
            for (var x=0; x<all_action_filters.length; x++) {
                if ($(all_action_filters[x]).data('facet_name') == filter_name) {
                    var existing_filter_values = $(all_action_filters[x]).data('facet_values');
                    for (var y=0; y<existing_filter_values.length; y++)
                        if (existing_filter_values[y] == filter_value)
                            return container;
                    $(all_action_filters[x]).data('facet_values').push(filter_value);
                }
            }
            container.find('a.save').click();
            return container;
        }
    };

    $.fn.dashboard_search_widget_search_filters = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_search_widget_search_filters' );
    };
})( jQuery );
