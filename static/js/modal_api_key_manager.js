(function($)
{
    var render_api_keys = function(data)
    {
        var api_keys = data.api_keys;
        $('#api_key_manager .waiting').hide();
        $('#api_key_manager .api_key_line_container').append($.tmpl('api_key_line', api_keys))
    };

    $.fn.modal_api_key_manager = function()
    {
        var modal = this;
        modal.find('.waiting').show();
        modal.find('.api_key_line_container').children().remove();
        modal.dialog
            (
                {
                    modal:true,
                    minHeight:450,
                    width:600,
                    draggable:false,
                    resizable:false,
                    buttons:
                    {
                        'Save and Exit':function()
                        {
                            var inputs = $('#api_key_manager .api_key_line input');
                            var return_data = [];
                            var store_data = {};
                            for (var x=0; x<inputs.length; x++)
                                if ($(inputs[x]).val() > '')
                                {
                                    var name = $(inputs[x]).attr('name');
                                    var value = $(inputs[x]).val();
                                    return_data.push(name + "=" + value);
                                    store_data[name] = value;
                                }
                            $('#api_key_store').data('store', store_data);
                            $.get('/dashboard/api_keys/save?' + return_data.join('&'));
                            $(this).dialog('close');
                            $('.dashboard').dashboard('render_collections');
                        }
                    }
                }
            );

        $.get('/dashboard/api_keys/load', function(data) { render_api_keys(data); });
    }
})(jQuery);