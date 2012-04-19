from threading import Thread
from django.contrib import messages
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
    if not request.user or not request.user.is_authenticated():
        Logger.Warn('%s - dashboard_load - dashboard load called with AnonymousUser' % __name__)
        messages.error(request, 'Sorry, you must be logged in to access this insight.')
        return redirect('/')
    dc = DashboardsController(request.user)
    db = dc.get_dashboard_by_id(id)
    Logger.Info('%s - dashboard - finished' % __name__)
    user_profile = request.user.profile
    if request.GET.get('company_id'):
        from companies.controllers import CompaniesController
        api_keys = {}
        for k in CompaniesController.GetCompanyAPIKeys(request.GET['company_id']):
            api_keys[k['type']] = k['api_key']
    else:
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
            'debug':'on' if settings.DEBUG else 'off',
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

def dashboard_get_action_template(request, name):
    Logger.Info('%s - dashboard_get_action_template - started' % __name__)
    action = { 'name': name }
    ac = ActionController(action)
    template = ac.get_content_item_template()
    Logger.Info('%s - dashboard_get_action_template - finished' % __name__)
    return JSONResponse({'template':template, 'name':name })

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

@login_required(login_url='/')
def maps_app(request):
    
    if request.method == 'POST':
        
        _save_datapoint(request)
        
        map_script = _generate_map_visualization(request)
        
        return render_to_response(
            'thedashboard/apps/map.html',
            {
                'map_script': map_script,
                'query': request.POST['query'] if 'query' in request.POST else "",
                'source': request.POST['source'] if 'source' in request.POST else "",
                'location': request.POST['location'] if 'location' in request.POST else "",
                'feed': [request.POST['feed']] if 'feed' in request.POST else None
            },
            context_instance=RequestContext(request))
    
    return render_to_response(
        'thedashboard/apps/map.html',
        {
        },
        context_instance=RequestContext(request))
    
def _save_datapoint(request):
    
    if request.POST["source"] == 'feed':
        element_value = request.POST["feed"]
        element_name = "url"
    else:
        element_value = request.POST["query"]
        element_name = "keywords"
    
    start_time = time.time()
    #data_point = request.POST['data_point']
    #data_point = json.loads(data_point)
    data_point = {
        "image_large":"/static/images/thedashboard/data_points/twitter_large.png",
        "configured_display_name":"Twitter: testquery",
        "image_medium":"/static/images/thedashboard/data_points/twitter_medium.png",
        "configured":True,
        "image_small":"/static/images/thedashboard/data_points/twitter_small.png",
        "id":"7970755b7c8e493d8583eed6a1c46ab9",
        "elements":[{
            "display_name":"What to search for",
            "type":"text",
            "name": element_name,
            "value": element_value,
            "help":"The keywords or hashtags that you want to use to search Twitter"
            },
            {
            "display_name":"Search Start Date",
            "type":"hidden",
            "name":"start_time",
            "value":"1334185102", #TODO need current time
            "help":""
            },
            {
            "display_name":"Search End Date",
            "type":"hidden",
            "name":"end_time",
            "value":"*",
            "help":""
            }],
        "display_name_short":"Twitter",
        "full_display_name":"Twitter Search",
        "type": request.POST["source"],
        "sub_type": request.POST["source"],
        "instructions":"Use this data point to search the public tweet stream."
        }
    dpc = DataPointController(data_point)
    dpc.data_point_added()
    #actions = request.POST['actions']
    #actions = json.loads(actions)
    actions = [
        {
        "display_name_long":"Location Detection",
        "image_large":"/static/images/thedashboard/actions/location_small.png",
        "elements":[
            {
            "type":"api_key",
            "display_name":"Your Yahoo API key",
            "name":"api_key",
            "value":"dj0yJmk9Y283MmUySEtzUTBEJmQ9WVdrOWNrUk1NMjlwTkdVbWNHbzlPRFk1TURVME9UWXkmcz1jb25zdW1lcnNlY3JldCZ4PTg2",
            "help":"Using Yahoo Placemaker requires an API key, to get one or change your's, click <a href=\"http://developer.yahoo.com/geo/placemaker/\" target=\"_blank\">here</a><br/><br/><span class=\"extra\">Getting a Yahoo Placemaker API Key is a little tricky but nothing to worry about.<br/><br/> First click on the link above and sign in with your Yahoo, Google or Facebook id. <br/>On the next screen you can enter \"metalayer\" for the application name, description and Application Owner (at the bottom). <br/>Then enter \"http://metalayer.com\" for the Application URL and Application domain and \"http://metalayer.com/favicon.ico\" for the Favicon URL. <br/>Finally enter \"support@metalayer.com\" for the Contact email. Then on the next screen, copy the api into the box above and click \"Save and Exit\".<br/><br/> You can of cause use your own details while singing up for an API key with Yahoo if you want to.</span>"
            }],
        "content_properties":
        {
        "added":[
            {
            "type":"location_string",
            "display_name":"Yahoo Placemaker Location",
            "name":"location"
            },
            {
            "type":"location_point",
            "display_name":"Yahoo Placemaker Points",
            "name":"point"
            }
            ]
        },
        "name":"yahooplacemaker",
        "configured":True,
        "instructions":"<div class=\"advanced\">This is an advanced feature and requires a bit of technical know-how to use. We're working to make this less painful, we promise.</div><br/>Yahoo Placemaker will extract location based information from content allowing you to visualize content on a map",
        "image_small":"/static/images/thedashboard/actions/location_small.png",
        "display_name_short":"Location",
        "id":"a3497017d643437491c0a1dde3565cef"
        }
    ]
    AggregationController.AggregateSingleDataPoint(data_point, actions)
    Logger.Debug('%s - dashboard_add_data_point - finished in %i seconds' % (__name__, int(time.time() - start_time)))


def _generate_map_visualization(request):
    
    visualization = _build_visualization(request)
    configuration = _build_configuration(request)
    
    vc = VisualizationController(visualization)
    
    search_query_additions_collection = vc.get_search_query_additions_collection(configuration)
    
    sc = SearchController(configuration)
    
    search_results_collection = [sc.run_search_and_return_results(sqa) for sqa in search_query_additions_collection]
    
    return vc.render_javascript_visualization_for_search_results_collection(search_results_collection, configuration)

def _build_visualization(request):
    
    visualization = {}
    
    for key in request.POST:
        print 'POST parameter key: %s value: %s' % (key, request.POST[key])
        visualization[key] = request.POST[key]
    
    visualization["id"] = "test"
    visualization["elements"] = [
        {
            "display_name":"Map type",
            "name":"map_mode",
            "value":"Regions",
            "values":[
                "Regions",
                "Markers"
            ],
            "type":"select",
            "help":"Region works best with country data while Marker works well with cities or other places"
        },
        {
            "display_name":"Map focus",
            "name":"focus",
            "value": request.POST['location'],
            "values":[
                "World",
                "North America",
                "Europe",
                "Asia",
                "Africa",
                "Americas",
                "Oceania"
            ],
            "type":"select",
            "help":"Choose a geographic region to focus the map on"
        },
        {
            "display_name":"Color Scheme",
            "name":"colorscheme",
            "value":"Blue",
            "values":[
                "Blue",
                "Green",
                "Grey",
                "Orange",
                "Purple",
                "RedBlue - Green",
                "Blue - Purple",
                "Green - Blue",
                "Orange - Red",
                "Purple - Red",
                "Yellow - Brown"
            ],
            "type":"select",
            "help":""
        },
        {
            "display_name":"Background",
            "name":"background",
            "value":"Light",
            "values":[
                "Light",
                "Dark"
            ],
            "type":"select",
            "help":""
        }
    ]
    
    visualization["data_dimensions"] = [
        {
            "type":"location_string",
            "display_name":"Location",
            "name":"locations",
            "help":"",
            "values":[
            {
                "name":"Yahoo Placemaker Location",
                "value":"action_yahooplacemaker_location_s"
            }],
            "value":
            {
                "name":"Yahoo Placemaker Location",
                "value":"action_yahooplacemaker_location_s"
            }
        }
    ]
    
    return visualization
    
def _build_configuration(request):
    
    #configuration = {
    #    'data_points':json.loads(request.POST['data_points']),
    #    'search_filters':json.loads(request.POST['search_filters'])
    #}
    
    if request.POST["source"] == 'feed':
        element_value = request.POST["feed"]
        element_name = "url"
    else:
        element_value = request.POST["query"]
        element_name = "keywords"
    
    configuration = {
        'data_points': [{
            "image_large":"/static/images/thedashboard/data_points/twitter_large.png",
            "configured_display_name":"Twitter: testquery",
            "image_medium":"/static/images/thedashboard/data_points/twitter_medium.png",
            "configured":True,
            "image_small":"/static/images/thedashboard/data_points/twitter_small.png",
            "id":"7970755b7c8e493d8583eed6a1c46ab9",
            "elements":[{
                "display_name":"What to search for",
                "type":"text",
                "name": element_name,
                "value": element_value,
                "help":"The keywords or hashtags that you want to use to search Twitter"
                },
                {
                "display_name":"Search Start Date",
                "type":"hidden",
                "name":"start_time",
                "value":"1334185102",
                "help":""
                },
                {
                "display_name":"Search End Date",
                "type":"hidden",
                "name":"end_time",
                "value":"*",
                "help":""
                }],
            "display_name_short":"Twitter",
            "full_display_name":"Twitter Search",
            "type": request.POST["source"],
            "sub_type": request.POST["source"],
            "instructions":"Use this data point to search the public tweet stream."
            }],
        'search_filters': []
    }
    
    return configuration


    