/***********************************************************************************************************************
 DASHBOARD - dashboard_visualizations
 ***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(configuration)
        {
            var dashboard_visualizations_container = this;
            var visualizations = configuration.visualizations;
            dashboard_visualizations_container.data('visualizations', visualizations);
            dashboard_visualizations_container.dashboard_visualizations('render');
            return dashboard_visualizations_container;
        },
        render:function()
        {
            var dashboard_visualizations_container = this;
            var visualizations = dashboard_visualizations_container.data('visualizations');

            dashboard_visualizations_container.children().remove();

            if (visualizations == null)
                return;

            for (var x=0; x<visualizations.length; x++)
            {
                var visualization_container_html = $('<div class="visualization"></div>');
                dashboard_visualizations_container.append(visualization_container_html);
                visualization_container_html.dashboard_visualization(visualizations[x]);
            }

            return dashboard_visualizations_container;
        },
        update:function()
        {
            var dashboard_visualizations_container = this;
            var visualizations = dashboard_visualizations_container.data('visualizations');

            //if there are unconfigured visualizations then dont repaint this area
            if (visualizations != null)
                for (var x=0; x<visualizations.length; x++)
                    if (!visualizations[x].configured)
                        return;

            dashboard_visualizations_container.children().remove();

            if (visualizations == null)
                return;

            for (var x=0; x<visualizations.length; x++)
            {
                var visualization_container_html = $('<div class="visualization"></div>');
                dashboard_visualizations_container.append(visualization_container_html);
                visualization_container_html.dashboard_visualization(visualizations[x]);
            }

            return dashboard_visualizations_container;
        },
        capture_snapshots:function()
        {
            var dashboard_visualizations_container = this;
            var visualizations = dashboard_visualizations_container.data('visualizations');
            for (var x=0; x<visualizations.length; x++)
            {
                var visualization_container = $('#v_' + visualizations[x].id);
                if (visualization_container.find('iframe').length > 0)
                    var visualization_snapshot = visualization_container.find('iframe').contents().find('svg').parent().html();
                else
                    var visualization_snapshot = visualization_container.find('svg').parent().html();
                if (visualization_snapshot != null && visualization_snapshot > ' ')
                    visualizations[x]['snapshot'] = visualization_snapshot;
            }
            dashboard_visualizations_container.parents('.dashboard').dashboard('save');
        }
    }

    $.fn.dashboard_visualizations = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_visualizations' );
    };

})( jQuery );
