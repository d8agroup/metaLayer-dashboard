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