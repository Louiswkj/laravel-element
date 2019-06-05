<!doctype html>
<html>
<head>
    <title>Upload Image</title>
    <style>
        #imgForm{
            max-width: 600px;
            margin: 0 auto;
        }
    </style>
    <script src="//cdn.staticfile.org/jquery/1.9.1/jquery.min.js"></script>
</head>
<body>
<form id="imgForm" action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" id="file1" name="image[]" multiple/>
    <br/>
    <label>
        <input type="checkbox" name="multi" checked /> 上传多个
    </label>
    <br/>
    <label>
        <input type="checkbox" name="optimize"/> 优化图片
    </label>
    <br/>
    <label>
        目录： <input type="text" name="dir" value="test" />
    </label>
    <br/>
    <label>
        旋转角度： <input type="text" name="rotate" placeholder="如：90" />
    </label>
    <br/>
    <label>
        旋转背景： <input type="text" name="rotateBackground" placeholder="如：#000000" />
    </label>
    <br/>
    <label>
        裁剪区域： <input type="text" name="clipRect" placeholder="如：10,10,100,100" />
    </label>
    <br/>
    <label>
        缩放至尺寸： <input type="text" name="thumbSize" placeholder="如：300x300" />
    </label>
    <br/>
    <button type="submit">Upload</button>

    <?= csrf_field() ?>
</form>
<div id="output"></div>
<script>
    $(function(){
        if (!window.FormData){
            console.error("FormData is not supported!");
            return;
        }

        $('[name=multi]').on('change', function(){
            if ($(this).is(':checked')){
                $('#file1').prop('multiple', true);
            } else {
                $('#file1').prop('multiple', false);
            }
        });

        var $output = $('#output');

        var $form = $('#imgForm');
        $form.on('submit', function(){
            var formData = new FormData($form[0]);

            $.ajax({
                type: 'POST',
                url: $form.attr('action'),
                data: formData,
                processData: false,
                contentType: false
            }).done(function(response){
                console.log("response: %o", response);
                $output.prepend($('<pre></pre>').text(typeof(response) === 'string' ? response + '' : JSON.stringify(response, null, ' ')));

                try {
                    response = (typeof(response) === 'string' ? JSON.parse(response) : response);
                } catch (e) {
                    window.alert('服务器返回的数据格式不正确！');
                    console.error(response);
                    console.error(e);
                    return;
                }

                if (response.success && response.data ){
                    var images = [response.data];
                    if (response.data.length){
                        images = response.data;
                    }

                    $.each(images, function(i, img){
                        $output.prepend('<div><img src="' + img.fullUrl + '" /><div>' + img.fullUrl + '</div><hr/></div>');
                    });
                }
            }).fail(function(error){
                window.alert("Upload failed: " + error);
                console.log("Upload failed: %o", arguments);
            });

            return false;
        });
    });
</script>
</body>
</html>