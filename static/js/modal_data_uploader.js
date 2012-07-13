(function($)
{
    $.fn.modal_data_uploader = function(data)
    {
        var modal = this;
        modal.data('data_point', data.data_point);
        modal.data('file_upload_id', guid());
        modal.find('#data_upload_waiting').hide();
        modal.find('#data_upload_stage_1').show();
        modal.find('#data_upload_stage_2').hide();
        modal.find('#data_upload_stage_2 #passed').hide();
        modal.find('#data_upload_stage_2 #failed').hide();
        modal.find('#data_upload_file_container').show();
        modal.find('.button').button();
        modal.find('.ui-state-highlight').mouseenter(function(){ $(this).addClass('ui-state-error');});
        modal.find('.ui-state-highlight').mouseleave(function(){ $(this).removeClass('ui-state-error');});
        modal.dialog
            (
                {
                    modal:false,
                    minHeight:250,
                    width:600,
                    draggable:false,
                    resizable:false
                }
            );
        new AjaxUpload('data_uploader_file',{
            action:'/u/file_from_dashboard',
            data:{
                csrfmiddlewaretoken:$('#csrf_form input').val(),
                data_point_type:$('#data_uploader').data('data_point').type,
                file_id:$('#data_uploader').data('file_upload_id')
            },
            name:'data_upload',
            onSubmit:function(file, extensions){
                $('#data_uploader #data_upload_stage_1').hide();
                $('#data_upload_file_container').hide();
                $('#data_uploader #data_upload_waiting').show();
                $('#data_upload_stage_2 #failed ul').children().remove();
            },
            onComplete:function(file, response){
                var json_response = jQuery.parseJSON(response);
                if (json_response.errors.length == 0){
                    var data_point = json_response.data_point;
                    data_point['id'] = $('#data_uploader').data('data_point').id;
                    var configuration = $('.dashboard').data('dashboard');
                    for (var x=0; x<configuration.collections.length; x++) {
                        for (var y=0; y<configuration.collections[x].data_points.length; y++) {
                            if (configuration.collections[x].data_points[y].id == data_point.id){
                                configuration.collections[x].data_points[y] = data_point;
                            }
                        }
                    }
                    $('.dashboard').dashboard('save').dashboard('render_collections');
                    $('#data_uploader #data_upload_waiting').hide();
                    $('#data_uploader #data_upload_stage_2').show();
                    $('#data_uploader #data_upload_stage_2 #passed').show();
                    setTimeout(function(){$('#data_uploader').dialog('close'); }, 1500);
                }
                else {
                    $('#data_upload_file_container').show();
                    $('#data_uploader #data_upload_waiting').hide();
                    $('#data_uploader #data_upload_stage_2').show();
                    $('#data_uploader #data_upload_stage_2 #failed').show();
                    for (var x=0; x<json_response.errors.length; x++) {
                        var template = "<li><div class='ui-state-error ui-corner-all'><p><span class='ui-icon ui-icon-alert'></span>ERROR</p></div></li>";
                        template = template.replace('ERROR', json_response.errors[x]);
                        $('#data_uploader #data_upload_stage_2 #failed ul').append(template);
                    }
                }
            }
        });
    }
})(jQuery);