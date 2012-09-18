(function($) {
    var methods = {
        open: function(data) {
            var modal = this;
            modal.dialog({
                modal: true,
                height: 410,
                width: 700,
                draggable: false,
                resizable: false,
                buttons: [
                    {
                        text: 'Save',
                        click: function() {
                            $(this).modal_output_report('save');
                        }
                    },{
                        text: 'Cancel',
                        click: function(event) {
                            data.remove_callback(event, data.container, data.output);
                            $(this).dialog('close');
                        }
                    }
                ],
            });
            return modal;
        },
        save: function() {
            // TODO: Implement this
        }
    };

    $.fn.modal_output_report = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.modal_output_report' );
    };
})(jQuery);
