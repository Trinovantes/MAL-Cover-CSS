'use strict';

$.when($.ready).then(function() {

    //-------------------------------------------------------------------------
    // Set up line numbers
    //-------------------------------------------------------------------------

    $('pre.line-numbers').each(function(i) {
        let highlights = $(this).data('highlights');
        let comments = $(this).data('comments');

        let lines = $(this).text().split('\n');
        $(this).empty();

        for (var i = 0; i < lines.length; i++) {
            let lineNum = i + 1;
            let node = $('<code>').text(lines[i]);

            if (highlights.includes(lineNum)) {
                node.addClass('highlight');
            }

            if (comments.includes(lineNum)) {
                node.addClass('comment');
            }

            $(this).append(node);
        }
    });

    //-------------------------------------------------------------------------
    // Register
    //-------------------------------------------------------------------------

    let form = $('form#signup');

    form.find('input#username').keyup(function(e) {
        form.find('span.info').fadeOut();
    });

    form.submit(function(e) {
        e.preventDefault();
        form.find('span.info').remove();

        $.ajax({
            url: '/users',
            type: 'POST',
            data: {
                username: $('input#username').val(),
            },
            complete: function(jqXHR, textStatus) {
                let node = $('<span>').text(jqXHR.responseText);
                node.addClass('info');
                node.addClass(textStatus);
                node.hide();

                form.append(node);
                node.fadeIn();
            },
        });
    });

});
