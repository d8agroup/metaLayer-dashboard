(function($)
{
    var methods = {
        open:function(data){
            var modal = this;
            modal.data('data_point', data.data_point);
            modal.dialog({
                modal:true,
                height:410,
                width:700,
                draggable:false,
                resizable:false,
                buttons:[
                    {
                        text:'Reset',
                        click:function(){
                            $(this).modal_data_uploader('render_stage_one');
                        }
                    },
                    {
                        text:'Close',
                        click:function(){
                            $(this).dialog('close');
                        }
                    }
                ]
            });
            modal.modal_data_uploader('render_stage_one');
            return modal;
        },
        render_stage_one:function() {
            var modal = this;
            modal.modal_data_uploader('update_progress_markers', 'one');
            modal.find('#steps').modal_data_uploader_stage_one();
            return modal;
        },
        render_stage_two:function(data) {
            var modal = this;
            modal.modal_data_uploader('update_progress_markers', 'two');
            modal.find('#steps').modal_data_uploader_stage_two(data);
            return modal;
        },
        render_stage_three:function() {
            var modal = this;
            modal.modal_data_uploader('update_progress_markers', 'three');
            modal.find('#steps').modal_data_uploader_stage_three();
            return modal;
        },
        update_progress_markers:function(stage){
            var modal = this;
            modal.find('.progress_marker').removeClass('active');
            modal.find('#progress_marker_' + stage).addClass('active');
            return modal;
        } 
    };

    $.fn.modal_data_uploader = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.modal_data_uploader' );
    };

})(jQuery);

(function($)
{
    var methods = {
        init:function(data){
            var container = this;
            var template = $.tmpl('data_uploader_stage_one');
            container.html(template);
            container.find('.button').button();
            var file_id = guid();
            $('#data_uploader').data('file_upload_id', file_id);
            new AjaxUpload('data_uploader_file',{
                action:'/u/file_from_dashboard',
                data:{
                    csrfmiddlewaretoken:$('#csrf_form input').val(),
                    data_point_type:$('#data_uploader').data('data_point').type,
                    file_id:file_id
                },
                name:'data_upload',
                onSubmit:function(file, extensions){
                    $('#data_uploader #steps').modal_data_uploader_stage_one('render_waiting');
                },
                onComplete:function(file, response){
                    var json_response = jQuery.parseJSON(response);
                    if (json_response.uploaders.length > 0){
                        setTimeout(function(){
                            $('#data_uploader').modal_data_uploader('render_stage_two', json_response);
                        }, 500);
                    }
                    else {
                        setTimeout(function(){
                            $('#data_uploader #steps').modal_data_uploader_stage_one('render_errors');
                        }, 500);
                    }
                }
            });
            return container;
        },
        render_waiting:function(){
            var container = this;
            container.find('.content').hide();
            container.find('.waiting').show();
            return container;
        },
        render_errors:function(){
            var container = this;
            if (container.find('.waiting').is(':visible')) {
                container.find('.waiting').hide();
                container.find('.content').show();
            }
            container.find('.upload_errors').show();
            return container;
        }
    };
    
    $.fn.modal_data_uploader_stage_one = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.modal_data_uploader_stage_one' );
    };
})(jQuery);

(function($)
{
    var methods = {
        init:function(data){
            var container = this;
            var data_uploaders = data.uploaders;
            var template = $.tmpl('data_uploader_stage_two');
            container.html(template);
            for (var x=0; x<data_uploaders.length; x++) {
                var item_template = $.tmpl('data_uploader_single_uploader', data_uploaders[x]);
                container.find('#uploader_list').append(item_template);
            }
            container.find('.uploader')
                .mouseenter(function(){ $(this).addClass('hover'); })
                .mouseleave(function(){ $(this).removeClass('hover'); })
                .click(function(){
                    $('#data_uploader .upload_errors').hide();
                    var datauploader_name = $(this).data('datauploader_name');
                    var file_id = $('#data_uploader').data('file_upload_id');
                    var data_point = $('#data_uploader').data('data_point');
                    var url = '/u/process_file_with_datauploader?file_id=' + file_id + '&datauploader_name=' + datauploader_name + '&data_point_type=' + data_point.type;
                    $.getJSON(url, function(data){
                        if (data.errors.length == 0) {
                            var data_point = data.data_point;
                            data_point['id'] = $('#data_uploader').data('data_point').id;
                            var configuration = $('.dashboard').data('dashboard');
                            for (var x=0; x<configuration.collections.length; x++) {
                               for (var y=0; y<configuration.collections[x].data_points.length; y++) {
                                   if (configuration.collections[x].data_points[y].id == data_point.id){
                                       configuration.collections[x].data_points[y] = data_point;
                                       configuration.collections[x].search_filters.time = null;
                                   }
                               }
                            }
                            $('.dashboard').dashboard('save').dashboard('render_collections');
                            $('#data_uploader').modal_data_uploader('render_stage_three');
                        }
                        else {
                            $('#data_uploader').modal_data_uploader_stage_two('render_errors', data.errors);
                        }
                    });
                    $('#data_uploader #steps').modal_data_uploader_stage_two('render_waiting');
                });
            return container;
        },
        render_waiting:function(){
            var container = this;
            container.find('.content').hide();
            container.find('.waiting').show();
            return container;
        },
        render_errors:function(errors){
            var container = this;
            if (container.find('.waiting').is(':visible')) {
                container.find('.waiting').hide();
                container.find('.content').show();
            }
            var error_container = container.find('.upload_errors');
            error_container.find('.error_list').children().remove();
            for (var x=0; x<errors.length; x++) {
                var template = '<div class="ui-state-error ui-corner-all"><p><span class="ui-icon ui-icon-info"></span><span class="message">ERROR</span></p></div>';
                template = template.replace('ERROR', errors[x]);
                error_container.find('.error_list').append(template);
            }
            error_container.show();
            return container;
        }
    };

    $.fn.modal_data_uploader_stage_two = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.modal_data_uploader_stage_two' );
    };
})(jQuery);

(function($)
{
    var methods = {
        init:function(){
            var container = this;
            var template = $.tmpl('data_uploader_stage_three');
            container.html(template);
            container.find('.button').button();
            container.find('#close_button').click(function() { $('#data_uploader').dialog('close'); });
            setTimeout(function(){ $('#data_uploader').dialog('close'); }, 2000);
            return container;
        }
    };

    $.fn.modal_data_uploader_stage_three = function( method )
    {
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.modal_data_uploader_stage_three' );
    };
})(jQuery);
