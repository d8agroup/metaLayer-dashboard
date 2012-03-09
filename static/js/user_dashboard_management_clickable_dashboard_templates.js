/***********************************************************************************************************************
 user_dashboard_management_clickable_dashboard_templates
***********************************************************************************************************************/
(function ( $ )
{
    $.fn.user_dashboard_management_clickable_dashboard_templates = function()
    {
        /*** START embedded functions ***/
        var render_dashboard_templates_function = function(data, container)
        {
            var template_data =
            {
                instructions:'Click a template to load a dashboard',
                css_class:'clickable',
                dashboard_templates:data.dashboard_templates
            };
            container.html($.tmpl('user_dashboard_management_dashboard_templates', template_data));
            container.find('.dashboard_template_image').click(function(){alert('hi')});
        };
        /*** END embedded functions ***/

        var draggable_dashboard_templates_container = this;
        var service_url = '/user/dashboard_management/get_dashboard_templates';
        $.get( service_url, function(data) { render_dashboard_templates_function(data, draggable_dashboard_templates_container)} );
    }
})( jQuery );