/***********************************************************************************************************************
 DASHBOARD - dashboard_search_widget - CHECKED 19/01/2012
***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(configuration)
        {
            this.data('configuration', configuration);
            this.dashboard_search_widget('render');
            return this;
        },
        render:function()
        {
            var update_base_search_start_and_end_time = function(current_start_and_end_time, data_points) {
                var current_base_end_time = current_start_and_end_time.search_end_time;
                var current_base_start_time = current_start_and_end_time.search_start_time;
                if (current_base_end_time == '*' && current_base_start_time == '*')
                    return {base_end_time:'*', base_start_time:'*'};
                var start_times = [];
                var end_times = [];
                for (var x=0; x<data_points.length; x++)
                    if (data_points[x].configured)
                        for (var y=0; y<data_points[x].elements.length; y++)
                            if (data_points[x].elements[y].name == 'start_time')
                                start_times.push(data_points[x].elements[y].value);
                            else if (data_points[x].elements[y].name == 'end_time')
                                end_times.push(data_points[x].elements[y].value);

                if (start_times.length == 0 && end_times.length == 0)
                    return { base_end_time:current_base_end_time, base_start_time:current_base_start_time };

                start_times.push(current_base_start_time);
                var new_base_start_time = null;
                if ($.inArray('*', start_times) > -1)
                    new_base_start_time = '*';
                else
                    $.each(start_times, function(i, start_time){
                        var start_time_int = parseInt(start_time);
                        if(!isNaN(start_time_int))
                            if (new_base_start_time == null || start_time_int < new_base_start_time)
                                new_base_start_time = start_time_int;
                    });

                end_times.push(current_base_end_time);
                var new_base_end_time = null;
                if ($.inArray('*', end_times) > -1)
                    new_base_end_time = '*';
                else
                    $.each(end_times, function(i, end_time){
                        var end_time_int = parseInt(end_time);
                        if(!isNaN(end_time_int))
                            if (new_base_end_time == null || end_time_int > new_base_end_time)
                                new_base_end_time = end_time_int;
                    });

                return { base_end_time:new_base_end_time.toString(), base_start_time:new_base_start_time.toString() };
            };

            var dashboard_search_widget = this;
            var configuration = dashboard_search_widget.data('configuration');
            if (configuration.base_search_configuration == null)
                configuration.base_search_configuration = {
                    search_start_time:null,
                    search_end_time:null
                };

            var updated_base_search_times = update_base_search_start_and_end_time(
                configuration.base_search_configuration,
                configuration.data_points);

            configuration.base_search_configuration.search_start_time = updated_base_search_times.base_start_time;
            configuration.base_search_configuration.search_end_time = updated_base_search_times.base_end_time;

            if (configuration.search_filters.time == null && configuration.base_search_configuration.search_start_time != null && configuration.base_search_configuration.search_end_time != null)
                configuration.search_filters.time = '[' +
                    configuration.base_search_configuration.search_start_time +
                    '%20TO%20' + configuration.base_search_configuration.search_end_time + ']';




//            var base_start_time = null;
//            for (var x=0; x<configuration.data_points.length; x++){
//                if (!configuration.data_points[x].configured)
//                    continue;
//
//                for (var y=0; y<configuration.data_points[x].elements.length; y++){
//                    //Calculate the base start and end time for this collection search based on the data points
//                    if (configuration.data_points[x].elements[y].name == 'start_time')
//                    {
//                        var new_value = configuration.data_points[x].elements[y].value;
//                        if (base_start_time == null)
//                            base_start_time = new_value;
//                        else
//                            if (new_value == '*' || (base_start_time != '*' && new_value < base_start_time))
//                                    base_start_time = new_value;
//                    }
//                }
//            }
//            configuration.base_search_configuration.search_start_time = (base_start_time != null) ? base_start_time : null;
//            var base_end_time = null;
//            for (var x=0; x<configuration.data_points.length; x++) {
//                if (!configuration.data_points[x].configured)
//                    continue;
//
//                for (var y=0; y<configuration.data_points[x].elements.length; y++)
//                    if (configuration.data_points[x].elements[y].name == 'end_time')
//                    {
//                        var new_value = configuration.data_points[x].elements[y].value;
//                        if (base_end_time == null)
//                            base_end_time = new_value;
//                        else
//                            if (new_value == '*' || (base_end_time != '*' && new_value > base_end_time))
//                                    base_end_time = new_value;
//                    }
//            }
//            configuration.base_search_configuration.search_end_time = (base_end_time != null) ? base_end_time : null;
//            configuration.search_filters.time = '[' + configuration.base_search_configuration.search_start_time + '%20TO%20' + configuration.base_search_configuration.search_end_time + ']';


            dashboard_search_widget.children().remove();
            for (var x=0; x<configuration.data_points.length; x++)
                if (!configuration.data_points[x].configured)
                {
                    var unconfigured_data_point_html = $("<div class='data_point_config_container'></div>");
                    dashboard_search_widget.html(unconfigured_data_point_html);
                    unconfigured_data_point_html.dashboard_unconfigured_data_point(configuration.data_points[x]);
                    return dashboard_search_widget;
                }

            for (var y=0; y<configuration.actions.length; y++)
                if (!configuration.actions[y].configured)
                {
                    var unconfigured_action_html = $("<div class='action_config_container'></div>");
                    dashboard_search_widget.html(unconfigured_action_html);
                    unconfigured_action_html.dashboard_unconfigured_action(configuration.actions[y]);
                    return dashboard_search_widget;
                }

            var options = configuration.options;
            var options_container_html = $("<div class='options_container'></div>");
            dashboard_search_widget.append(options_container_html.dashboard_search_widget_options_panel(options));

            var data_points = configuration.data_points;
            var actions = configuration.actions;
            var data_points_and_actions_container_html = $("<div class='data_points_and_actions_container'></div>");
            dashboard_search_widget.append(data_points_and_actions_container_html.dashboard_search_widget_data_points_and_actions({data_points:data_points, actions:actions}));

            var search_filters_html = $('<div class="search_filters"></div>');
            dashboard_search_widget.append(search_filters_html);

            var search_results_html = $("<div class='search_results_container'></div>");
            dashboard_search_widget.append(search_results_html);

            if (configuration.waiting_for_action_to_be_applied)
                dashboard_search_widget.dashboard_search_widget('apply_waiting');
            else
                dashboard_search_widget.dashboard_search_widget('run_search');

            //Removed additional save, remove completely on next iteation: MG 20120802
            //dashboard_search_widget.parents('.dashboard').dashboard('save');
            return dashboard_search_widget;
        },
        run_search:function(data)
        {
            var really_run_search_function = function(search_widget)
            {
                var render_search_results_function = function(data, configuration)
                {
                    var run_search_at_interval_function = function(search_widget)
                    {
                        search_widget.dashboard_search_widget('run_search');
                    };

                    var search_results = data.search_results;
                    configuration.search_results = search_results;
                    var search_filters = configuration.search_filters;
                    var base_search_configuration = configuration.base_search_configuration;

                    if (base_search_configuration.facet_range_groups == null)
                        base_search_configuration.facet_range_groups = {};

                    if (search_results.stats == null) {
                        base_search_configuration.facet_range_groups = {}
                    }
                    else {
                        var stats_keys = Object.keys(search_results.stats);
                        for (var x=0; x<stats_keys.length; x++) {
                            var stat = stats_keys[x];
                            if (base_search_configuration.facet_range_groups[stat] == null)
                                base_search_configuration.facet_range_groups[stat] = {};
                            if (base_search_configuration.facet_range_groups[stat].min == null || search_filters[stat] == null)
                                base_search_configuration.facet_range_groups[stat].min = (search_results.stats[stat] != null)
                                    ? search_results.stats[stat].min
                                    : 0;

                            if (base_search_configuration.facet_range_groups[stat] == null)
                                base_search_configuration.facet_range_groups[stat] = {};
                            if(base_search_configuration.facet_range_groups[stat].max == null || search_filters[stat] == null)
                                base_search_configuration.facet_range_groups[stat].max = (search_results.stats[stat] != null)
                                    ? search_results.stats[stat].max
                                    : 0;
                        }
                    }

                    var actions = configuration.actions;
                    search_widget.find('.search_results_container').dashboard_search_results({search_results:search_results, search_filters:search_filters, actions:actions});
                    search_widget.find('.search_filters').dashboard_search_widget_search_filters({search_results:search_results, search_filters:search_filters, base_search_configuration:base_search_configuration});
                    search_widget.find('.search_results_container').jScrollPane( { topCapHeight:40, bottomCapHeight:40 } );
                    search_widget.dashboard_search_widget('remove_waiting');
                    search_widget.parents('.collection_container').dashboard_collection('search_results_updated');
                    setTimeout(function() { run_search_at_interval_function(search_widget) }, 30000);
                };

                var configuration = search_widget.data('configuration');
                if (configuration != null)
                    $.post
                        (
                            '/dashboard/run_search',
                            {
                                data_points:JSON.stringify(configuration.data_points),
                                search_filters:JSON.stringify(configuration.search_filters),
                                actions:JSON.stringify(configuration.actions),
                                csrfmiddlewaretoken:$('#csrf_form input').val()
                            },
                            function(data) { render_search_results_function(data, configuration); }
                        );
            };

            var dashboard_search_widget = this;
            if(dashboard_search_widget.find('.search_filters_controls').is(':visible'))
            {
                setTimeout(function() { dashboard_search_widget.dashboard_search_widget('run_search') }, 30000);
                return;
            }

            dashboard_search_widget.dashboard_search_widget('apply_waiting');
            setTimeout(function() {really_run_search_function(dashboard_search_widget)}, 1000);
            return dashboard_search_widget;
        },
        remove_data_point:function(data_point_id)
        {
            var dashboard_search_widget = this;
            var configuration = dashboard_search_widget.data('configuration');
            var new_data_points = [];
            for (var x=0; x<configuration.data_points.length; x++)
                if (configuration.data_points[x].id != data_point_id)
                    new_data_points[new_data_points.length] = configuration.data_points[x];
            dashboard_search_widget.data('configuration').data_points = new_data_points;
            if(new_data_points.length == 0)
                dashboard_search_widget.parents('.collection_container').dashboard_collection('render');
            else
                dashboard_search_widget.dashboard_search_widget('render');
            dashboard_search_widget.parents('.dashboard').dashboard('save');
            return dashboard_search_widget;
        },
        remove_action:function(action_id)
        {
            var dashboard_search_widget = this;
            var configuration = dashboard_search_widget.data('configuration');
            var new_actions = [];
            for (var x=0; x<configuration.actions.length; x++)
                if (configuration.actions[x].id != action_id)
                    new_actions[new_actions.length] = configuration.actions[x];
            dashboard_search_widget.data('configuration').actions = new_actions;
            dashboard_search_widget.data('configuration').search_filters = {};
            dashboard_search_widget.parents('.collection_container').dashboard_collection('render');
            return dashboard_search_widget;
        },
        apply_search_filter:function(data){
            var container = this;
            container.find('.search_filters').dashboard_search_widget_search_filters('apply_search_filter', data);
            return container;
        },
        apply_waiting:function(){
            var dashboard_search_widget = this;
            dashboard_search_widget.find('.options_container .refresh_data img').attr(
                'src',
                '/static/images/thedashboard/icon_clock_loading.gif'
            ).addClass('loading');
            return dashboard_search_widget;
        },
        remove_waiting:function(){
            var dashboard_search_widget = this;
            dashboard_search_widget.find('.options_container .refresh_data img').attr(
                'src',
                '/static/images/thedashboard/icon_clock.png'
            ).removeClass('loading');
            return dashboard_search_widget;
        }
    };

    $.fn.dashboard_search_widget = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_search_widget' );
    };
})( jQuery );