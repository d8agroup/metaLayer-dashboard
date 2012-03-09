/***********************************************************************************************************************
 DASHBOARD - collections panel - CHECKED 18/01/2012
 ***********************************************************************************************************************/
(function( $ )
{
    var methods =
    {
        init:function(data)
        {
            var collections_panel = this;
            var collections = data.collections;
            var collection_class = 'collections_' + collections.length;
            collections_panel.children().remove();
            for (var x=0; x<collections.length; x++)
            {
                var collection_container_html = $('<div class="collection_container ' + collection_class + '"></div>');
                collections_panel.append(collection_container_html)
                collection_container_html.dashboard_collection({ collection:collections[x] });
                collection_container_html.dashboard_collection('render');
            }
            return collections_panel;
        },
        data_point_start_dragging:function()
        {
            var collections_panel = this;
            collections_panel.find('.collection_container').dashboard_collection('data_point_start_dragging');
            return collections_panel;
        },
        data_point_stop_dragging:function()
        {
            var collections_panel = this;
            collections_panel.find('.collection_container').dashboard_collection('data_point_stop_dragging');
            return collections_panel;
        }
    };

    $.fn.dashboard_collections_panel = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_collections_panel' );
    }
})( jQuery );


