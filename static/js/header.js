(function( $ )
    {
        var methods =
        {
            init:function(data)
            {
                var header = this;
                var dashboard = data.dashboard;
                header.data('dashboard', dashboard);
                $('.help').corner('5px bottom');
                this.find('a.config_link').click
                (
                    function(e)
                    {
                        if($('.visualizations_container').length > 0)
                            $('.visualizations_container').dashboard_visualizations('capture_snapshots');
                        if($('.search_widget').length == 0)
                        {
                            $.get('/dashboard/delete/' + dashboard.id);
                            return true;
                        }
                        $('.dashboard').dashboard('save');
                        $('#on_exit_modal').on_exit_modal('open', { dashboard:dashboard, leave_dashboard:$(this).attr('id') != 'configure_link' });
                        return false;
                    }
                );
                this.find('.help_link').click
                    (
                        function()
                        {
                            var link = $(this);
                            if (link.is('.active'))
                            {
                                link.removeClass('active');
                                $('.help').slideUp();
                                link.html('Show Help');
                            }
                            else
                            {
                                link.addClass('active');
                                $('.help').slideDown();
                                link.html('Hide Help');
                            }
                        }
                    );
            },
            dashboard_saved:function()
            {
                var header = this;
                if (header.find('.saving').length > 0)
                    return;
                var saving_html = $("<span class='saving'>Saving ...</span>");
                header.find('#logo_container').append(saving_html);
                saving_html.fadeIn();
                setTimeout
                    (
                        function()
                        {
                            saving_html.fadeOut
                                (
                                    function()
                                    {
                                        saving_html.remove();
                                    }
                                );
                        },
                        2000
                    );
            }
        }

        $.fn.header = function( method )
        {
            // Method calling logic
            if ( methods[method] )
                return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            else if ( typeof method === 'object' || ! method )
                return methods.init.apply( this, arguments );
            else
                $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }
    }
)( jQuery );