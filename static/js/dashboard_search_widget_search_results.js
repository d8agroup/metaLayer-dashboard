/***********************************************************************************************************************
 DASHBOARD - dashboard_search_results - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(data)
        {
            var dashboard_search_results = this;
            var search_results = data.search_results;
            var search_filters = data.search_filters;
            var search_actions = data.actions;
            dashboard_search_results.data('search_results', search_results);
            dashboard_search_results.data('search_filters', search_filters);
            dashboard_search_results.data('search_actions', search_actions);
            dashboard_search_results.dashboard_search_results('render');
            return dashboard_search_results;
        },
        render:function()
        {
            var search_results_container = this;
            var search_results = search_results_container.data('search_results');
            var search_actions = search_results_container.data('search_actions');
            search_results_container.children().remove();

            if ($.isEmptyObject(search_results))
            {
                var empty_search_results_html = $("<div class='empty_search_results'></div>");
                search_results_container.append(empty_search_results_html);
                apply_waiting(empty_search_results_html, 'Refreshing Results');
            }
            else
            {
                var search_results_content_items_html = $('<ul class="content_items"></ul>');
                search_results_container.append(search_results_content_items_html.dashboard_search_results_content_items({search_results:search_results, search_actions:search_actions}));
                search_results_container.find('.action_inline_filter').click(function(event){
                    event.preventDefault();
                    var link = $(this);
                    var data = {
                        filter_name: link.data('facet_name'),
                        filter_value: link.data('facet_value')
                    };
                    link.parents('.collection_container').dashboard_collection('apply_search_filter', data);
                })
            }
            return search_results_container;
        }
    };

    $.fn.dashboard_search_results = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_search_results' );
    };
})( jQuery );