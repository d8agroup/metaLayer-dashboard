/***********************************************************************************************************************
 DASHBOARD - dashboard_search_widget_search_filters - CHECKED 19/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    $.fn.dashboard_search_widget_search_filters = function(data)
    {
        var keywords_input_focus_function = function(element, keywords_mask)
        {
            if (element.val() == keywords_mask)
                element.val('')
        };
        var keywords_input_blur_function = function(element, keywords_mask)
        {
            if (element.val() == '')
                element.val(keywords_mask)
        };
        var keywords_input_keypress_function = function(event, element)
        {
            if (event.which == 13)
            {
                event.preventDefault();
                if (element.val() == '')
                    element.parents('.keywords_container').find('.remove_keyword_filter').click();
                else
                    element.parents('.keywords_container').find('.apply_keyword_filter').click();
            }
        };
        var apply_keywords_filter_click_function = function(element, keywords_mask, container)
        {
            var keywords = element.parents('.keywords_container').find('input').val();
            if (keywords == keywords_mask)
                return;
            container.data('search_filters')['keywords'] = keywords;
            element.parents('.collection_container').dashboard_collection('render');
        };
        var remove_keywords_filter_click_function = function(container)
        {
            container.data('search_filters')['keywords'] = '';
            container.parents('.collection_container').dashboard_collection('render');
        };

        var search_filters_container = this;
        var keywords_mask = 'filter by keywords';
        var search_results = data.search_results;
        var search_filters = data.search_filters;
        var template_data = {
            keywords:(search_results.keywords == '') ? keywords_mask : search_results.keywords,
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
        search_filters_container.find('.keywords_container input')
            .focus( function() { keywords_input_focus_function($(this), keywords_mask); } )
            .blur( function() { keywords_input_blur_function($(this), keywords_mask); } )
            .keypress( function(e) { keywords_input_keypress_function(e, $(this)); } )
            .blur();
        search_filters_container.find('.apply_keyword_filter').click
            (
                function() { apply_keywords_filter_click_function($(this), keywords_mask, search_filters_container); }
            );

        search_filters_container.find('.remove_keyword_filter').click
            (
                function() { remove_keywords_filter_click_function(search_filters_container); }
            );
        return this
    }
})( jQuery );
