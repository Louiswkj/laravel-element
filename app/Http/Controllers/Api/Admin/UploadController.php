<?php
/**
 * Created by PhpStorm.
 * User: zengfanwei
 * Date: 2018/11/7
 * Time: 14:25
 */

namespace App\Http\Controllers\Api\Admin;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use FlexImage\Controllers\FlexImageController;
use Symfony\Component\HttpKernel\Exception\NotAcceptableHttpException;

class UploadController extends Controller
{
    protected $allowedOrigins = [
        'larvuent.com',   // 域名
    ];

    public function index()
    {
        return view('upload');
    }

    /**
     * @throws ApiException
     * @throws \ReflectionException
     * @return {
     *      "originalName": "banner@2x.png",
     *      "fileSize": 30141,
     *      "extName": ".png",
     *      "path": "/uploads/20160623/1432394367ec.png",
     *      "fullUrl": "http://img.mainaer.com/uploads/20160623/1432394367ec.png",
     *      "optimizedSize": false
     *  }
     */
    public function upload(Request $request)
    {
        if ($request->method() == 'POST' && !Str::endsWith(parse_url($request->header('Referer'), PHP_URL_HOST), $this->allowedOrigins)){
            throw new AccessDeniedHttpException('You are not allowed to upload image.');
        }

        $response = app()->call([app(FlexImageController::class), 'upload']);
        return $this->withAccessControlAllowOriginHeader($response);
    }

    public function options()
    {
        $response = response()->make(json_encode(['success' => true])); // 很奇怪，HTTPS下，response的内容不能为空，否则headers发不出去。。。
        $response->headers->add([
            'Allow' => 'GET,HEAD,POST'
        ]);

        return $this->withAccessControlAllowOriginHeader($response);
    }

    protected function withAccessControlAllowOriginHeader($response)
    {
        $request = app()->make(Request::class);
        $origin = $request->headers->get('Origin');
        if (!$origin){
            $referrer = $request->headers->get('Referer');
            if ($referrer){
                $urlInfo = parse_url($referrer);
                if (!empty($urlInfo['scheme']) && !empty($urlInfo['host'])){
                    $origin = $urlInfo['scheme'] .'://' . $urlInfo['host'] . (empty($urlInfo['port']) ? '' : $urlInfo['port']);
                }
            }
        }

        if (Str::endsWith($origin, $this->allowedOrigins)){
            $response->headers->set('Access-Control-Allow-Origin', $origin);

            $xMethods = $request->headers->get('Access-Control-Request-Method');
            if (!empty($xMethods)){
                $response->headers->set('Access-Control-Allow-Methods', $xMethods);
            }

            $xHeaders = $request->headers->get('Access-Control-Request-Headers');
            if (!empty($xHeaders)){
                $response->headers->set('Access-Control-Allow-Headers', $xHeaders);
            }

        }

        return $response;
    }

}