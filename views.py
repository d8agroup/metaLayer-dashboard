from threading import Thread
from django.shortcuts import render_to_response, redirect
from django.views.decorators.cache import never_cache
from django.http import HttpResponse
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.utils import simplejson as json
from django.conf import settings
import time
from metalayercore.actions.controllers import ActionController
from metalayercore.aggregator.controllers import AggregationController
from metalayercore.datapoints.controllers import DataPointController
from logger import Logger
from metalayercore.outputs.controllers import OutputController
from metalayercore.search.controllers import SearchController
from metalayercore.dashboards.controllers import DashboardsController
from utils import JSONResponse
from metalayercore.visualizations.controllers import VisualizationController

################################################################################
# ASYNC REQUESTS                                                               #
################################################################################
def async(gen):
    def func(*args, **kwargs):
        it = gen(*args, **kwargs)
        result = it.next()
        Thread(target=lambda: list(it)).start()
        return result
    return func

def dashboard_load(request, id):
    Logger.Info('%s - dashboard - started' % __name__)
    Logger.Debug('%s - dashboard - started with id:%s' % (__name__, id))
    dc = DashboardsController(request.user)
    db = dc.get_dashboard_by_id(id)
    Logger.Info('%s - dashboard - finished' % __name__)
    user_profile = request.user.profile
    raw_api_keys = user_profile.api_keys
    api_keys = {}
    for api_key in raw_api_keys:
        api_keys[api_key['name']] = api_key['api_key']
    api_keys = json.dumps(api_keys)
    return render_to_response(
        'thedashboard/dashboard.html',
        {
            'dashboard_id':db['id'],
            'INSIGHT_CATEGORIES':settings.INSIGHT_CATEGORIES,
            'api_keys': api_keys,
            'static_host':settings.STATIC_HOST,
        },
        context_instance=RequestContext(request))

@login_required(login_url='/')
def dashboard_new(request, template_id):
    Logger.Info('%s - dashboard_new - started' % __name__)
    Logger.Debug('%s - dashboard_new - started with id:%s' % (__name__, id))
    dc = DashboardsController(request.user)
    db = dc.create_new_dashboard_from_template(template_id)
    Logger.Info('%s - dashboard_new - finished' % __name__)
    return redirect(dashboard_load, '%s' % db.id)

@login_required(login_url='/')
def dashboard_remix(request, id):
    Logger.Info('%s - dashboard_remix - started' % __name__)
    Logger.Debug('%s - dashboard_remix - started with id:%s' % (__name__, id))
    dc = DashboardsController(request.user)
    db = dc.create_new_dashboard_from_dashboard(id)
    Logger.Info('%s - dashboard_remix - finished' % __name__)
    return redirect(dashboard_load, '%s' % db.id)

@async
@login_required(login_url='/')
def dashboard_delete(request, id):
    Logger.Info('%s - dashboard_delete - started' % __name__)
    Logger.Debug('%s - dashboard_delete - started with id:%s' % (__name__, id))
    yield JSONResponse()
    dc = DashboardsController(request.user)
    db = dc.get_dashboard_by_id(id)
    if db and db['username'] == request.user.username:
        dc.delete_dashboard_by_id(id)
    Logger.Info('%s - dashboard_delete - finished' % __name__)

def dashboard(request, id):
    Logger.Info('%s - dashboard - started' % __name__)
    dc = DashboardsController(request.user)
    db = dc.get_dashboard_by_id(id)
    Logger.Info('%s - dashboard - finished' % __name__)
    return JSONResponse({'dashboard':db.__dict__})

def dashboard_get_all_widgets(request):
    Logger.Info('%s - dashboard_get_all_data_points - started' % __name__)
    #TODO: Need to get the options from the request.user and pass them to the controller
    data_points = DataPointController.GetAllForTemplateOptions(None)
    actions = ActionController.GetAllForTemplateOptions(None)
    outputs = OutputController.GetAllForTemplateOptions(None)
    visualizations = VisualizationController.GetAllForTemplateOptions(None)
    Logger.Info('%s - dashboard_get_all_data_points - finished' % __name__)
    return JSONResponse({'data_points':data_points, 'actions':actions, 'outputs':outputs, 'visualizations':visualizations})

@login_required(login_url='/')
def dashboard_validate_data_point(request):
    Logger.Info('%s - dashboard_validate_data_point - started' % __name__)
    data_point = request.POST['data_point']
    data_point = json.loads(data_point)
    dpc = DataPointController(data_point)
    passed, errors = dpc.is_valid()
    if not passed:
        Logger.Info('%s - dashboard_validate_data_point - finished' % __name__)
        return JSONResponse({'passed':passed, 'errors':errors})
    configured_display_name = dpc.get_configured_display_name()
    return JSONResponse({'passed':passed, 'errors':errors, 'configured_display_name':configured_display_name})

@login_required(login_url='/')
def dashboard_remove_data_point(request):
    Logger.Info('%s - dashboard_remove_data_point - started' % __name__)
    data_point = request.POST['data_point']
    data_point = json.loads(data_point)
    dpc = DataPointController(data_point)
    dpc.data_point_removed()
    Logger.Info('%s - dashboard_remove_data_point - finished' % __name__)
    return JSONResponse()

@login_required(login_url='/')
def dashboard_add_data_point_with_actions(request):
    Logger.Info('%s - dashboard_add_data_point - started' % __name__)
    start_time = time.time()
    data_point = request.POST['data_point']
    data_point = json.loads(data_point)
    dpc = DataPointController(data_point)
    dpc.data_point_added()
    actions = request.POST['actions']
    actions = json.loads(actions)
    AggregationController.AggregateSingleDataPoint(data_point, actions)
    Logger.Debug('%s - dashboard_add_data_point - finished in %i seconds' % (__name__, int(time.time() - start_time)))
    Logger.Info('%s - dashboard_add_data_point - finished' % __name__)
    return JSONResponse()

@login_required(login_url='/')
def dashboard_validate_action(request):
    Logger.Info('%s - dashboard_validate_action - started' % __name__)
    action = request.POST['action']
    action = json.loads(action)
    ac = ActionController(action)
    passed, errors = ac.is_valid()
    if not passed:
        Logger.Info('%s - dashboard_validate_action - finished' % __name__)
        return JSONResponse({'passed':passed, 'errors':errors})
    configured_display_name = ac.get_configured_display_name()
    return JSONResponse({'passed':passed, 'errors':errors, 'configured_display_name':configured_display_name})

@login_required(login_url='/')
def dashboard_remove_action(request):
    Logger.Info('%s - dashboard_remove_action - started' % __name__)
    action = request.POST['action']
    action = json.loads(action)
    ac = ActionController(action)
    ac.action_removed()
    Logger.Info('%s - dashboard_remove_action - finished' % __name__)
    return JSONResponse()


@login_required(login_url='/')
def dashboard_add_action_to_data_points(request):
    Logger.Info('%s - dashboard_add_action_to_data_points - started' % __name__)
    action = request.POST['action']
    action = json.loads(action)
    data_points = request.POST['data_points']
    data_points = json.loads(data_points)
    ac = ActionController(action)
    ac.action_added()
    AggregationController.AggregateMultipleDataPointHistoryWithAction(action, data_points, 50)
    Logger.Info('%s - dashboard_add_action_to_data_points - finished' % __name__)
    return JSONResponse()

@login_required(login_url='/')
def dashboard_get_output_url(request):
    Logger.Info('%s - dashboard_get_output_url - started' % __name__)
    output = request.POST['output']
    output = json.loads(output)
    oc = OutputController(output)
    url = oc.generate_url()
    output['url'] = url
    Logger.Info('%s - dashboard_get_output_url - finished' % __name__)
    return JSONResponse({'output':output})

@login_required(login_url='/')
def dashboard_output_removed(request):
    Logger.Info('%s - dashboard_output_removed - started' % __name__)
    output = request.POST['output']
    output = json.loads(output)
    oc = OutputController(output)
    oc.output_removed()
    Logger.Info('%s - dashboard_output_removed - finished' % __name__)
    return JSONResponse()

@login_required(login_url='/')
def dashboard_remove_visualization(request):
    Logger.Info('%s - dashboard_visualization_removed - started' % __name__)
    visualization = request.POST['visualization']
    visualization = json.loads(visualization)
    vc = VisualizationController(visualization)
    vc.visualization_removed()
    Logger.Info('%s - dashboard_visualization_removed - finished' % __name__)
    return JSONResponse()

@never_cache
def dashboard_run_visualization(request):
    Logger.Info('%s - dashboard_run_visualization - started' % __name__)
    visualization = request.POST['visualization']
    visualization = json.loads(visualization)
    configuration = {
        'data_points':json.loads(request.POST['data_points']),
        'search_filters':json.loads(request.POST['search_filters'])
    }
    vc = VisualizationController(visualization)
    search_query_additions_collection = vc.get_search_query_additions_collection(configuration)
    sc = SearchController(configuration)
    search_results_collection = [sc.run_search_and_return_results(sqa) for sqa in search_query_additions_collection]
    content = vc.render_javascript_visualization_for_search_results_collection(search_results_collection, configuration)
    content_type = 'text/javascript; charset=UTF-8'
    Logger.Info('%s - dashboard_run_visualization - finished' % __name__)
    return HttpResponse(content=content, content_type=content_type)

def dashboard_run_search(request):
    Logger.Info('%s - dashboard_run_search - started' % __name__)
    start_time = time.time()
    configuration = {
        'data_points':json.loads(request.POST['data_points']),
        'search_filters':json.loads(request.POST['search_filters'])
    }
    sc = SearchController(configuration)
    search_results = sc.run_search_and_return_results()
    Logger.Debug('%s - dashboard_run_search - finished in %i seconds' % (__name__, int(time.time() - start_time)))
    Logger.Info('%s - dashboard_run_search - finished' % __name__)
    return JSONResponse({'search_results':search_results})

def dashboard_get_content_item_template(request, type, sub_type):
    Logger.Info('%s - dashboard_get_content_item_template - started' % __name__)
    data_point = { 'type':type, 'sub_type':sub_type }
    dpc = DataPointController(data_point)
    template = dpc.get_content_item_template()
    Logger.Info('%s - dashboard_get_content_item_template - finished' % __name__)
    return JSONResponse({'template':template, 'type':type, 'sub_type':sub_type})

@login_required(login_url='/')
@async
def dashboard_save(request):
    yield JSONResponse()
    Logger.Info('%s - dashboard_save - started' % __name__)
    dashboard = json.loads(request.POST['dashboard'])
    user = request.user
    dbc = DashboardsController(user)
    dbc.update_dashboard(dashboard)
    Logger.Info('%s - dashboard_save - finished' % __name__)

@login_required(login_url='/')
def load_api_keys(request):
    def user_has_api_value(dp_name, u):
        for apik in u.profile.api_keys:
            if apik['name'] == dp_name:
                return apik['api_key']
        return ''
    user = request.user
    data_points = DataPointController.GetAllForTemplateOptions(user)
    data_point_api_keys = [{
        'name':dp['type'],
        'display_name':dp['full_display_name'],
        'api_key':user_has_api_value(dp['type'], user),
        'help_text':DataPointController.ExtractAPIKeyHelp(dp['type'])}
        for dp in data_points if [e for e in dp['elements'] if e['name'] == 'api_key']]
    action_api_keys = [{
        'name':a['name'],
        'display_name':a['display_name_long'],
        'api_key':user_has_api_value(a['name'], user),
        'help_text':ActionController.ExtractAPIKeyHelp(a['name'])}
        for a in ActionController.GetAllForTemplateOptions(user)
        if [e for e in a['elements'] if e['name'] == 'api_key']]
    return JSONResponse({ 'api_keys':data_point_api_keys + action_api_keys })

@login_required(login_url='/')
def save_api_keys(request):
    api_keys = [{'name': key, 'api_key': request.GET[key]}  for key in request.GET]
    user = request.user
    profile = user.profile
    profile.api_keys = api_keys
    profile.save()
    return JSONResponse()