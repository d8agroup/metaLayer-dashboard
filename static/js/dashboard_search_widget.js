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
            if (configuration.search_filters.time == null)
            {
                var date = new Date();
                var two_hours_ago = ((date.valueOf() * 0.001)|0) - 7200;
                configuration.search_filters.time = '[' + two_hours_ago + '%20TO%20*]';
            }
            this.dashboard_search_widget('render');
            return this;
        },
        render:function()
        {
            var dashboard_search_widget = this;
            var configuration = dashboard_search_widget.data('configuration');

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

            dashboard_search_widget.dashboard_search_widget('run_search');
            dashboard_search_widget.parents('.dashboard').dashboard('save');
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
                    search_widget.find('.search_results_container').dashboard_search_results({search_results:search_results, search_filters:search_filters});
                    search_widget.find('.search_filters').dashboard_search_widget_search_filters({search_results:search_results, search_filters:search_filters});

                    if(!EMBEDDED_MODE)
                        search_widget.find('.search_results_container').jScrollPane( { topCapHeight:40, bottomCapHeight:40 } );
                    search_widget.find('.options_container .refresh_data img').attr('src', '/static/images/thedashboard/icon_clock.png' ) .removeClass('loading');
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
                                csrfmiddlewaretoken:$('#csrf_form input').val()
                            },
                            function(data) { render_search_results_function(data, configuration); }
                        );
            };

            var dashboard_search_widget = this;
            dashboard_search_widget.find('.options_container .refresh_data img').attr
                (
                    'src',
                    '/static/images/thedashboard/icon_clock_loading.gif'
                )
                .addClass('loading');

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
            dashboard_search_widget.parents('.collection_container').dashboard_collection('render');
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