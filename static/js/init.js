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

function display_time2(time)
{
    var d = new Date(time * 1000);
    var date_parts = d.toString().split(' ');
    return date_parts[1] + ' ' + date_parts[2] + ' ' + date_parts[3] + ' ' + date_parts[4]
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

function strip_html(text) {
    if (text == null)
        return '';
    var all_text = '';
    for (var x=0; x<text.length; x++)
        all_text += text[x];
    return all_text.replace(/<(?:.|\n)*?>/gm, '');
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

function search_encode_extension_property(extension_name, property_type)
{
    var encoded_property = 'extensions_' + extension_name + '_' + property_type;
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
    if (_gaq == null)
        return;
    if (label != null)
        _gaq.push(['_trackEvent', category, action, label]);
    else
        _gaq.push(['_trackEvent', category, action]);
}

function display_text_abstract(text) {
    if (text == null)
        return '';
    var all_text = '';
    for (var x=0; x<text.length; x++)
        all_text += text[x];
    all_text = strip_html(all_text);
    return all_text.substring(0, 200) + ' ...';
}

function truncate_characters_with_mouseover(text, limit) {
    var text_as_string = '';
    for (var x=0; x<text.length; x++)
        text_as_string += text[x];

    if (text_as_string.length <= limit)
        return text_as_string;

    if (limit < 4)
        limit = 4;

    var first_part = text_as_string.substring(0, limit - 4) + '<span class="more_indicator"> ...</span>';
    var second_part = '<span class="more hidden">' + text_as_string.substring(limit - 4, text_as_string.length) + '</span>';
    return first_part + second_part;
}

function extract_facet_display_name(facet_name) {
    var name_parts = facet_name.split('_');
    if (name_parts.length == 3)
        return name_parts[1];
    if (name_parts.length == 4)
        return name_parts[2];
    return facet_name;
}

function render_dynamic_content_item_actions_and_extensions(data) {
    var template = "<li class='action_values' style='margin-top:0;'>" +
                   "    <label>DISPLAY_NAME</label>" +
                   "    <span style='font-weight:bold'>" +
                   "        <a class='action_inline_filter' data-facet_name='FACET_NAME' data-facet_value='FACET_VALUE'>" +
                   "            FACET_VALUE" +
                   "        </a>" +
                   "    </span>" +
                   "</li>";

    var html = '';

    for (var key in data) {
        if ((key.substring(0, 'action_'.length) !== 'action_') && (key.substring(0, 'extensions_'.length) !== 'extensions_'))
            continue;
        var display_name = extract_facet_display_name(key);
        if (key == display_name)
            continue;

        var value = data[key];
        if (isNaN(value)) {
            var value_as_string = '';
            for (var x=0; x<value.length; x++)
                value_as_string += value[x];
        }
        else {
            value_as_string = value.toString();
        }
        value_as_string = truncate_characters_with_mouseover(value_as_string, 70);
        html += template.replace(/DISPLAY_NAME/g, display_name)
            .replace(/FACET_NAME/g, key)
            .replace(/FACET_VALUE/g, value_as_string);
    }

    return html;
}

function map_option_groups(data_point) {
    for (var x=0; x<data_point.elements.length; x++) {
        if (data_point.elements[x].type == 'multiple_select') {
            var values = data_point.elements[x].values;
            var option_groups = null;
            for (var y=0; y<values.length; y++){
                if (values[y].option_group != null){
                    if (option_groups == null)
                        option_groups = {};
                    if (option_groups[values[y].option_group] == null)
                        option_groups[values[y].option_group] = [];
                    option_groups[values[y].option_group].push(values[y]);
                }
            }
            var option_groups_array = [];
            if (option_groups != null) {
                for (var key in option_groups) {
                    var option_group = {
                        name:key,
                        options:option_groups[key]
                    };
                    option_groups_array.push(option_group);
                }
            }
            else {
                option_groups_array.push({
                    name:null,
                    options:values
                });
            }
            data_point.elements[x].values = option_groups_array;
        }
    }
    return data_point;
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
        var time = parseInt(new Date().getTime() * 0.001);
        $.getJSON('/u/get_all_templates_with_options?time=' + time, function(uploaders){
            for(var x=0; x<uploaders.length; x++)
                $.template('dashboard_search_results_content_items_customdata_' + uploaders[x].name, uploaders[x].template);
        });
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_search_filters.html?time=' + time, function(t) { $.template('dashboard_search_widget_search_filters', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_options_panel.html?time=' + time, function(t) { $.template('dashboard_search_widget_options_panel', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_data_point.html?time=' + time, function(t) { $.template('dashboard_search_widget_data_point', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/search_widget/dashboard_search_widget_action.html?time=' + time, function(t) { $.template('dashboard_search_widget_action', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/data_points/dashboard_unconfigured_data_point.html?time=' + time, function(t) { $.template('dashboard_unconfigured_data_point', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/data_points/dashboard_unconfigured_data_point_waiting.html?time=' + time, function(t) { $.template('dashboard_unconfigured_data_point_waiting', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/data_points/dashboard_unconfigured_data_point_oauth.html?time=' + time, function(t) { $.template('dashboard_unconfigured_data_point_oauth', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/actions/dashboard_unconfigured_action.html?time=' + time, function(t) { $.template('dashboard_unconfigured_action', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/outputs/output_url.html?time=' + time, function(t) { $.template('output_url', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/outputs/output_render.html?time=' + time, function(t) { $.template('output_render', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/visualization_header.html?time=' + time, function(t) { $.template('visualization_header', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/visualization_container.html?time=' + time, function(t) { $.template('visualization_container', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/unconfigured_visualization_container.html?time=' + time, function(t) { $.template('unconfigured_visualization_container', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/visualizations/unconfigurable_visualization_container.html?time=' + time, function(t) { $.template('unconfigurable_visualization_container', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/modals/api_key_line.html?time=' + time, function(t) { $.template('api_key_line', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/modals/data_uploader_stage_one.html?time=' + time, function(t) { $.template('data_uploader_stage_one', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/modals/data_uploader_stage_two.html?time=' + time, function(t) { $.template('data_uploader_stage_two', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/modals/data_uploader_stage_three.html?time=' + time, function(t) { $.template('data_uploader_stage_three', t)});
        $.get('http://' + html_host + '/static/html/thedashboard/modals/data_uploader_single_uploader.html?time=' + time, function(t) { $.template('data_uploader_single_uploader', t)});
    }
);
