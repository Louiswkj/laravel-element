<?php
/**
 * Created by PhpStorm.
 * User: ibogood
 * Date: 2016/3/31
 * Time: 14:57
 */
namespace App\Http\Controllers\Api\Admin;
use App\Exceptions\ApiException;
use App\Helpers\ApiStatus;
use Illuminate\Support\Facades\Input;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BaseController extends \App\Http\Controllers\Controller{

    /**
     * 导出数据
     */
    public function export($method='')
    {
        $_REQUEST['pq_export'] = 1;

        if ($method && $method !== __FUNCTION__ && method_exists($this, $method)){
            return app()->call([$this, $method]);
        }

        if (method_exists($this, 'pqlists')){
            return app()->call([$this, 'pqlists']);
        }

        if (method_exists($this, 'lists')){
            return app()->call([$this, 'lists']);
        }

        throw new NotFoundHttpException();
    }

    /**
     * 快速创建一个错误
     *
     * @param int         $status  参见ApiStatus::ERR_XXXX
     * @param string|null $message 错误消息
     * @param mixed       $data    错误相关的数据
     * @return array
     */
    protected function error($status, $message = '', $data = '')
    {
        $message = $message ? : ApiStatus::getMessage($status);
        return [
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ];
    }

    /**
     * 快速返回一个成功的数据
     *
     * @param array       $data    成功的数据
     * @param int         $status  参见ApiStatus
     * @param string|null $message 成功的消息
     * @return array
     */
    protected function success($data = array(), $status = ApiStatus::SUCCESS, $message = '')
    {
        return [
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ];
    }


    /**
     * 将参数的格式规整化
     *
     * @param $paramsFormat
     * @return array
     */
    public function normalizeParams($paramsFormat)
    {
        $params = [];
        foreach ($paramsFormat as $paramName => $formatInfo) {
            $formatInfo = is_string($formatInfo) ? [$formatInfo] : $formatInfo;
            $paramType = $formatInfo[0];
            $paramIsRequired = !array_key_exists('default', $formatInfo);
            $paramDefaultValue = isset($formatInfo['default']) ? $formatInfo['default'] : null;
            $paramValue = Input::get($paramName);

            //增加如果传非空且没有默认值 然后unset掉这个参数
            $paramIsUnset  = !array_key_exists('unset',$formatInfo);
            if ($paramIsRequired && empty($paramValue && $paramIsUnset)) {
                break;
            }


            switch ($paramType) {
                case 'int':
                    $paramValue = intval($paramValue);
                    break;
                case 'bool':
                case 'boolean':
                    $paramValue = boolval($paramValue);
                    break;
                case 'str':
                case 'string':
                    $paramValue = strval($paramValue);
                    break;
                case 'float':
                    $paramValue = floatval($paramValue);
                    break;
                case 'double':
                    $paramValue = doubleval($paramValue);
                    break;
                case 'array':
                    if(!is_array($paramValue)){
                        //throw new ApiException('not array', ApiStatus::ERR_MISSING_ARGUMENT);
                        $paramValue = [];
                    }
                    break;
                default:
                    break;
            }

            if ($paramIsRequired && empty($paramValue)) {
                $errorMessage = isset($formatInfo[1]) ? $formatInfo[1] : '缺少参数' . $paramName;
                throw new ApiException($errorMessage, ApiStatus::ERR_MISSING_ARGUMENT);
            }

            $paramValue = $paramValue ?: $paramDefaultValue;
            $params[$paramName] = $paramValue;
        }

        return $params;
    }
}