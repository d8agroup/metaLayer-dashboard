var location_details = {};

$(document).ready
(
    function()
    {
         // Toggles the left panel
        $("div.tab").click(function(e) {
           var panel_container = $("div.panel-container"), ANIMATION_SPEED = 500;
           
           if(panel_container.css("left") === "0px")
              panel_container.animate({ left: "-200px"}, ANIMATION_SPEED);
           else
              panel_container.animate({ left: "0px"}, ANIMATION_SPEED);
              
        });
        
        $("form[name='search'] input[name='source']").click(function() {
           
           if($(this).prop('value') == 'feed') {
              $("form[name='search'] input[name='query']").prop("disabled", true);
           } else {
              $("form[name='search'] input[name='query']").prop("disabled", false);
           }
         });
    }
);

function display_location_dialog(location) {
   
   if(location_details[location] && location_details[location].length > 0) {
      
      var table_html = '<tr><th><strong>Source</strong></th><th><strong>Content</strong></th></tr>\n';
      for(var i=0; i < location_details[location].length; i++) {
         table_html += '<tr><td class="clearfix"><img src="' + location_details[location][i].author_image + '" /><p><a target="_blank" href="' + location_details[location][i].link + '" >' + location_details[location][i].title + '</a></p></td></tr>\n';
      }
      
      $('#location_dialog_message').text('');
      $('#location_dialog_data').html(table_html);
      
   } else {
      $('#location_dialog_message').text('Sorry, no information is available for this location.');
      $('#location_dialog_data').html('');
   }
   
   $('#location_dialog').dialog({
      draggable: true,
      resizable: false,
      width: 450
   });
   
}

function open_feed_modal() {
   
   $('#feed_dialog').dialog({
      draggable: false,
      resizable: false
   });
   
}

function close_feed_modal() {
   var current_feed;
   
   // clear 'feed' ection in the real form
   $("#feed-data-placeholder").html("")
   
   // populate form with the feed files defined in this dialog
   $("#feed_configuration input[name='feed']").each(function(idx) {
      current_feed = $(this).val();
      
      if(current_feed.length > 0) {
         $("#feed-data-placeholder").append("<input type=\"hidden\" name=\"feed\" value=\"" + current_feed + "\" />");
      }
   });
   
   $("#feed_dialog").dialog("close");
}