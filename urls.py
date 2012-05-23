from django.conf.urls.defaults import patterns, url
from views import *

urlpatterns = patterns('',
    url(r'load/(\w+)$', dashboard),
    url(r'new/(\w+)$', dashboard_new),
    url(r'remix/(\w+)$', dashboard_remix),
    url(r'delete/(\w+)$', dashboard_delete),
    url(r'widgets/get_all$', dashboard_get_all_widgets),
    url(r'data_points/validate$', dashboard_validate_data_point),
    url(r'data_points/remove_data_point$', dashboard_remove_data_point),
    url(r'data_points/add_data_point_with_actions$', dashboard_add_data_point_with_actions),
    url(r'actions/validate$', dashboard_validate_action),
    url(r'actions/remove_action$', dashboard_remove_action),
    url(r'actions/add_action_to_data_points$', dashboard_add_action_to_data_points),
    url(r'visualizations/remove_visualization$', dashboard_remove_visualization),
    url(r'visualizations/run_visualization/\d+$', dashboard_run_visualization),
    url(r'outputs/get_url$', dashboard_get_output_url),
    url(r'outputs/get_render$', dashboard_get_output_render),
    url(r'outputs/remove_output$', dashboard_output_removed),
    url(r'run_search$', dashboard_run_search),
    url(r'data_points/get_content_item_template/(\w+)/(\w+)', dashboard_get_content_item_template),
    url(r'actions/get_content_item_template/(\w+)', dashboard_get_action_template),
    url(r'api_keys/load', load_api_keys),
    url(r'api_keys/save', save_api_keys),
    url(r'save$', dashboard_save),
    url(r'(\w+)$', dashboard_load)
)