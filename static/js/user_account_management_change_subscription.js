/***********************************************************************************************************************
 user_account_management_change_subscription
 ***********************************************************************************************************************/
(function ( $ )
{
    var methods =
    {
        init:function()
        {
            var change_subscription_container = this;
            change_subscription_container.children().remove();
            apply_waiting(change_subscription_container, 'Reloading Prices');
            var render_service_return_function = function(container, template)
            {
                container.html(template);
                container.find('a').each
                    (
                        function(i, e)
                        {
                            var element = $(e);
                            var subscription_id = element.data('subscription_id');
                            element.click
                                (
                                    function()
                                    {
                                        element.parents('#change_subscription_container').user_account_management_change_subscription
                                            (
                                                'render_change_to_subscription',
                                                { subscription_id:subscription_id }
                                            )
                                    }
                                );
                        }
                    );
            }
            $.get
                (
                    '/user/change_subscription',
                    function(template) { render_service_return_function(change_subscription_container, template); }
                );
        },
        render_change_to_subscription:function(data)
        {
            var change_subscription_container = this;
            var subscription_id = data.subscription_id;

            var render_change_to_subscription_callback = function(container, template)
            {
                container.html(template);
                container.find('.cancel').click
                    (
                        function(e)
                        {
                            e.preventDefault();
                            change_subscription_container.user_account_management_change_subscription();
                        }
                    );
                container.find('.submit').click
                    (
                        function(e)
                        {
                            e.preventDefault();
                            var service_url = '/user/change_subscription';
                            if (container.find('.purchase_form').length > 0)
                            {
                                var post_data =
                                {
                                    subscription_id:subscription_id,
                                    first_name:container.find('.first_name').val(),
                                    last_name:container.find('.last_name').val(),
                                    credit_card_number:container.find('.credit_card_number').val(),
                                    credit_card_expiry_month:container.find('.credit_card_expiry_month').val(),
                                    credit_card_expiry_year:container.find('.credit_card_expiry_year').val(),
                                    csrfmiddlewaretoken:$('#csrf_form input').val()
                                };
                            }
                            else
                            {
                                var post_data =
                                {
                                    subscription_id:subscription_id,
                                    csrfmiddlewaretoken:$('#csrf_form input').val()
                                };
                            }
                            apply_waiting(container.parents('#user_home'), 'Processing your subscription change');
                            $.post
                                (
                                    service_url,
                                    post_data,
                                    function(data)
                                    {
                                        container.find('.errors').hide();
                                        if (data.errors != null)
                                        {
                                            container.find('.error_container').prepend
                                                (
                                                    "<div class='alert errors'>" +
                                                        "<p>Sorry, we found the following errors while processing your payment:</p>" +
                                                    "</div>"  
                                                );
                                            for (var x=0; x<data.errors.length; x++)
                                                container.find('.errors').append('<p>' + data.errors[x] + '</p>');
                                            remove_waiting(container.parents('#user_home'));
                                        }
                                        else
                                        {
                                            remove_waiting(container.parents('#user_home'));
                                            container.parents('#user_home').user_home('refresh');
                                        }
                                    }
                                );
                        }
                    );
                return this;
            };

            var service_url = '/user/change_subscription?subscription_id=' + subscription_id;
            $.get( service_url, function(template) { render_change_to_subscription_callback(change_subscription_container, template)} );
        }
    }

    $.fn.user_account_management_change_subscription = function( method )
    {
        // Method calling logic
        if ( methods[method] ) return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        else if ( typeof method === 'object' || ! method ) return methods.init.apply( this, arguments );
        else $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
})( jQuery );