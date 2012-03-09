/***********************************************************************************************************************
SITE WIDE FUNCTIONS
***********************************************************************************************************************/
function guid()
{
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace
    (
        /[xy]/g,
        function(c)
        {
            var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);
        }
    );
}

function clone(object)
{
    var newObj = (object instanceof Array) ? [] : {};
    for (i in object)
    {
        if (i == 'clone')
            continue;
        if (object[i] && typeof object[i] == "object")
            newObj[i] = clone(object[i]);
        else
            newObj[i] = object[i];
    }
    return newObj;
};

function display_time(time)
{
    var d = new Date(time * 1000);
    return d.toUTCString();
}

function wait(ms)
{
    ms += new Date().getTime();
    while (new Date() < ms){}
}

function apply_waiting(element, text)
{
    var waiting_template = $.tmpl('waiting_large', {text:text});
    element.append(waiting_template);
    waiting_template.css({ opacity:0.7,top:0, width:element.outerWidth(), height:element.outerHeight() });
    waiting_template.find('p').css({ top:(element.height() / 2) });
}

function remove_waiting(element)
{
    element.find('.waiting').remove();
}

function apply_helper_class_functions(element)
{
    element.find('.helper_corner').corner();
}

function clean_user_generated_html(element)
{
    element.find('a').each
    (
        function()
        {
            $(this).attr('target', '_blank');
        }
    )
}

function search_encode_property(action_name, property_name, property_type)
{
    var encoded_property = 'action_' + action_name + '_' + property_name;
    if (property_type == "string")
        encoded_property += '_s';
    else if (property_type == 'location_string')
        encoded_property += '_s';
    else
        encoded_property += '_s';
    return encoded_property
}

function access_api_key_store_value(key)
{
    var store = $('#api_key_store').data('store');
    return (store != null) ? store[key] : '';
}

function track_event(category, action, label)
{
    if (label != null)
        _gaq.push(['_trackEvent', category, action, label]);
    else
        _gaq.push(['_trackEvent', category, action]);
}

$(document).ready
(
    function()
    {
        /* Waiting Large Area*****************************************************************/
        $.template
        (
            'waiting_large',
            "<div class='waiting waiting_large'>" +
                "<p>{{html text}}<img src='/static/images/thedashboard/loading_circle.gif' /></p>" +
            "</div>"
        );

        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_search_filters.html', function(t) { $.template('dashboard_search_widget_search_filters', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_options_panel.html', function(t) { $.template('dashboard_search_widget_options_panel', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_data_point.html', function(t) { $.template('dashboard_search_widget_data_point', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_action.html', function(t) { $.template('dashboard_search_widget_action', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/data_points/dashboard_unconfigured_data_point.html', function(t) { $.template('dashboard_unconfigured_data_point', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/actions/dashboard_unconfigured_action.html', function(t) { $.template('dashboard_unconfigured_action', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/outputs/output_url.html', function(t) { $.template('output_url', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/visualization_header.html', function(t) { $.template('visualization_header', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/visualization_container.html', function(t) { $.template('visualization_container', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/unconfigured_visualization_container.html', function(t) { $.template('unconfigured_visualization_container', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/unconfigurable_visualization_container.html', function(t) { $.template('unconfigurable_visualization_container', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/modals/api_key_line.html', function(t) { $.template('api_key_line', t)});
    }
);