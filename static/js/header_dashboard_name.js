(function($)
{
    $.fn.header_dashboard_name = function(dashboard)
    {
        var dashboard_name = this;
        dashboard_name.data('dashboard', dashboard);
        var name_mask = 'Untitled';
        if (dashboard.name == null || dashboard.name == '')
            this.val(name_mask);
        else
            this.val(dashboard.name);

        dashboard_name
            .focus
            (
                function()
                {
                    if (dashboard_name.val() == name_mask)
                        dashboard_name.val('')
                    dashboard_name.addClass('editing').addClass('focus');
                }
            )
            .blur
            (
                function()
                {
                    if (dashboard_name.val() == '')
                        dashboard_name.val(name_mask);
                    dashboard_name.removeClass('editing').removeClass('focus');
                }
            )
            .keyup
            (
                function()
                {
                    var value = dashboard_name.val();
                    setTimeout
                        (
                            function()
                            {
                                if (value == dashboard_name.val())
                                {
                                    $('.dashboard').data('dashboard').name = dashboard_name.val();
                                    $('.dashboard').dashboard('save');
                                }
                            },
                            2000
                        );
                }
            )
            .mouseover
            (
                function()
                {
                    dashboard_name.addClass('editing');
                }
            )
            .mouseout
            (
                function()
                {
                    if (!dashboard_name.is('focus'))
                        dashboard_name.removeClass('editing').removeClass('focus');
                }
            );

    }
})(jQuery);