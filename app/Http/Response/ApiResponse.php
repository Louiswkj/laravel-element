<?php


namespace App\Http\Response;

use App\Exceptions\ApiException;
use App\Helpers\ApiStatus;
use App\Helpers\Utils;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\ResponseTrait;
use Illuminate\Support\Facades\Request;
use Symfony\Component\HttpFoundation\Response as BasicResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ApiResponse extends BasicResponse implements \ArrayAccess, Arrayable
{
    use ResponseTrait;

    protected $jsonData = [];
    protected $exception = null;
    protected $pretty = false;

    public function __construct($content = [], $httpStatus = 200, array $headers = [])
    {
        parent::__construct('', $httpStatus, $headers);

        $this->jsonData = $content;
        $this->headers->add([
            'Content-Type' => 'application/json',
//            'Access-Control-Allow-Origin' => '*',
//            'Access-Control-Allow-Credentials' => 'false',
            'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate'
        ]);
    }

    /**
     * 发送内容
     *
     * @return $this
     */
    public function sendContent()
    {
        echo $this->getContent();
        return $this;
    }

    /**
     * 获取内容
     *
     * @return string
     */
    public function getContent()
    {
        if ($this->pretty){
            return json_encode($this->jsonData, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
        }

        return json_encode($this->jsonData);
    }

    /**
     * @return array|mixed|string
     */
    public function getJsonData()
    {
        return $this->jsonData;
    }

    /**
     * @param array|mixed|string $jsonData
     */
    public function setJsonData($jsonData)
    {
        $this->jsonData = $jsonData;
    }

    /**
     * 设置是否返回格式化好的内容
     * @param bool $isPretty
     */
    public function setPretty($isPretty=true)
    {
        $this->pretty = $isPretty;
    }

    /**
     * @return bool 是否是成功的，包括返回的JSON数据是否OK
     */
    public function isSuccessful()
    {
        return parent::isSuccessful() && data_get($this->jsonData, 'status') == ApiStatus::SUCCESS;
    }

    public function isEmpty()
    {
        return parent::isEmpty();
    }

    public function getException()
    {
        return $this->exception;
    }

    public function setException($e)
    {
        $this->exception = $e;
    }

    /**
     * @param $response
     * @return static
     */
    public static function createFrom($response)
    {
        // 如果传入一个闭包，则执行它 -- 返回的即是API的应答
        if ($response instanceof \Closure){
            try {
                // 自定义异常处理程序 -- 以便在异常的时候也能顺便返回API的格式
                $app = app();
                $app->setExceptionHandler(function($e){
                    app()->reportExceptionIfNeeded($e);
                    ApiResponse::createFrom($e)->send();
                });

                // 执行
                $response = $response();

                // 为了便于后续处理，还是恢复默认异常处理程序
                $app->restoreExceptionHandler();
            } catch (\Exception $e){
                app()->reportExceptionIfNeeded($e);
                $response = $e;
            }
        }

        $httpStatus = 200;

        if (is_array($response)) {
            $responseData = $response;
        } elseif (empty($response)) {
            $responseData = ['status' => ApiStatus::ERR_EMPTY_RESPONSE];
        } elseif ($response instanceof ApiResponse) {
            $responseData = $response->getJsonData();
            $httpStatus = $response->getStatusCode();
            $httpHeaders = $response->headers;
        } elseif ($response instanceof Arrayable) {
            $responseData = $response->toArray();
        } elseif ($response instanceof Jsonable) {
            $responseString = $response->toJson();
        } elseif ($response instanceof BasicResponse) {
            $responseString = $response->getContent();
            $httpStatus = $response->getStatusCode();
            $httpHeaders = $response->headers;
        } elseif (is_string($response)) {
            $responseString = $response;
        } elseif ($response instanceof \Exception){
            $exception = $response;
            if ($exception instanceof ApiException) {
                $responseData = ['status' => $exception->getCode(), 'message' => $exception->getMessage()];
            } elseif ($exception instanceof NotFoundHttpException || $exception instanceof ModelNotFoundException) {
                $responseData = ['status' => ApiStatus::ERR_NOT_FOUND];
            } else if ($exception instanceof HttpException) {
                if ($exception->getStatusCode() == '404') {
                    $responseData = ['status' => ApiStatus::ERR_NOT_FOUND];
                } else {
                    $responseData = [
                        'status' => ApiStatus::ERR_INTERNAL_EXCEPTION,
                        'message' => ($exception->getMessage() ?: 'HTTP EXCEPTION') . '(' . $exception->getStatusCode() . ')'
                    ];
                }
            } elseif ($exception instanceof \PDOException){
                $responseData = ['status' => ApiStatus::ERR_DB_FAIL];
            } elseif ($exception instanceof \Exception) {
                $responseData = ['status' => ApiStatus::ERR_INVALID_ARGUMENT, 'message' => $exception->getMessage()];
                $httpStatus = 400; // 代表参数错误
                if (env('APP_ENV') !== 'production'){
                    Log::info("[InvalidArg]: " . $exception->getMessage());
                }
            } else {
                $responseData = ['status' => ApiStatus::ERR_INTERNAL_EXCEPTION];
            }

            // 如果开启了调试模式，则将异常信息返回
            if (env('APP_DEBUG')){
                $exceptionHandler = app()->make(\Illuminate\Contracts\Debug\ExceptionHandler::class);
                if ($exceptionHandler->shouldReport($exception)){
                    $responseData['__exception__'] = Utils::getExceptionSummary($exception, $withTrace = true);
                }
            }

        } else {
            $responseData = ['status' => ApiStatus::ERR_INVALID_RESPONSE];
            if (env('APP_DEBUG')) {
                $responseData['__response__'] = $response;
            }
        }

        if (isset($responseString)) {
            $responseData = json_decode($responseString, true);
            if (!is_array($responseData) || json_last_error() != JSON_ERROR_NONE) {
                $responseData = ['status' => ApiStatus::ERR_INVALID_RESPONSE];
                if (env('APP_DEBUG')) {
                    $responseData['__response__'] = $response;
                }
            }
        }

        $responseData['status'] = isset($responseData['status']) ? intval($responseData['status']) : ApiStatus::ERR_UNKNOWN;
        $responseData['message'] = !empty($responseData['message']) ? $responseData['message'] : ApiStatus::getMessage($responseData['status']);
        $responseData['data'] = isset($responseData['data']) ? self::sanitizeApiResponseData($responseData['data']) : null;

        if ($response instanceof ApiResponse) {
            $response->setJsonData($responseData);
            $response->setStatusCode($httpStatus);
        } else {
            $response = new static($responseData, $httpStatus, []);
        }

        if (isset($httpHeaders)){
            if ($httpHeaders instanceof \Symfony\Component\HttpFoundation\ResponseHeaderBag){
                $response->headers = clone $httpHeaders;
            } else if (is_array($httpHeaders)){
                $response->headers->add($httpHeaders);
            } else {
                foreach ($httpHeaders as $key => $val) {
                    $response->headers->set($key, $val);
                }
            }
        }

        if (isset($exception)){
            $response->setException($exception);
        }

        return $response;
    }

    /**
     * 获取请求的来源
     *
     * @return string
     */
    public function getRequestOrigin()
    {
        if (isset($_SERVER['HTTP_REFERER'])) {
            $refererInfo = parse_url($_SERVER['HTTP_REFERER']);
            if (isset($refererInfo['host']) && isset($refererInfo['scheme'])) {
                if (isset($refererInfo['port']) && $refererInfo['port'] != 80) {
                    return $refererInfo['scheme'] . '://' . $refererInfo['host'] . ':' . $refererInfo['port'];
                } else {
                    return $refererInfo['scheme'] . '://' . $refererInfo['host'];
                }
            }
        }

        return Request::getHttpHost();
    }

    /**
     * 规范化返回值 -- APP不支持bool值，转换为 0/1.  空值也会出问题，转换为空字符串
     * @param mixed $data
     * @return mixed
     */
    public static function sanitizeApiResponseData($data)
    {
        if ($data === false || $data === null || $data === '' || (is_array($data) && empty($data))){
            return null;
        }

        if (is_array($data)){
            // 处理一级内容
            foreach ($data as &$value) {
                if ($value === false){
                    $value = 0;
                } else if ($value === true){
                    $value = 1;
                } // else：啥也不用处理
            }

            unset($value);


            // 处理列表内容：
            if (!empty($data['list'])){
                foreach ($data['list'] as &$value) {
                    if ($value === false){
                        $value = 0;
                    } else if ($value === true){
                        $value = 1;
                    } // else：啥也不用处理
                }

                unset($value);
            }
        }

        return $data;
    }

    /**
     * 快速返回一个成功的数据
     *
     * @param array           $data    成功的数据
     * @param string|int|null $message 成功的消息或错误码
     * @param int|string|null $status  状态嘛，参见ApiStatus （或消息）
     * @return static
     */
    public static function success($data = '', $message = '', $status = ApiStatus::SUCCESS)
    {
        // 兼容($data, $status, $message)的参数列表
        if (is_int($message)) {
            list($message, $status) = [$status == ApiStatus::SUCCESS ? '' : $status, $message];
        }

        return static::createFrom([
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * 快速创建一个错误
     *
     * @param int         $status  参见ApiStatus::ERR_XXXX
     * @param string|null $message 错误消息
     * @param mixed       $data    错误相关的数据
     * @return static
     */
    public static function error($status, $message = '', $data = '')
    {
        // 兼容($message, $status)的参数列表
        if (!is_int($status)) {
            list($message, $status) = [$status, $message ?: ApiStatus::ERR_UNKNOWN];
        }

        return static::createFrom([
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * @param array|string $controllerAction
     * @param array $requestParams
     * @param array $funcArgs
     * @return \App\Http\Response\ApiResponse
     */
    public static function fromInternalApi($controllerAction, $requestParams=[], $funcArgs=[])
    {
        $response = app()->callApi($controllerAction, $funcArgs, $requestParams);
        if ($response instanceof ApiResponse){
            return $response;
        } else {
            return static::createFrom($response);
        }
    }

    /**
     * @param array|string $controllerAction
     * @param array $args
     * @param array $requestParams
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public static function loadDataFromInternalApiOrFail($controllerAction, $requestParams=[], $funcArgs=[])
    {
        $response = self::fromInternalApi($controllerAction, $requestParams, $funcArgs);
        if (!$response->isSuccessful()){
            throw new ApiException($response['status'], $response['message'], $response->getException());
        }

        return $response['data'];
    }

    /**
     * Whether a offset exists
     *
     * @link  http://php.net/manual/en/arrayaccess.offsetexists.php
     * @param mixed $offset <p>
     *                      An offset to check for.
     *                      </p>
     * @return boolean true on success or false on failure.
     *                      </p>
     *                      <p>
     *                      The return value will be casted to boolean if non-boolean was returned.
     * @since 5.0.0
     */
    public function offsetExists($offset)
    {
        return isset($this->jsonData[$offset]);
    }

    /**
     * Offset to retrieve
     *
     * @link  http://php.net/manual/en/arrayaccess.offsetget.php
     * @param mixed $offset <p>
     *                      The offset to retrieve.
     *                      </p>
     * @return mixed Can return all value types.
     * @since 5.0.0
     */
    public function offsetGet($offset)
    {
        return $this->jsonData[$offset];
    }

    /**
     * Offset to set
     *
     * @link  http://php.net/manual/en/arrayaccess.offsetset.php
     * @param mixed $offset <p>
     *                      The offset to assign the value to.
     *                      </p>
     * @param mixed $value  <p>
     *                      The value to set.
     *                      </p>
     * @return void
     * @since 5.0.0
     */
    public function offsetSet($offset, $value)
    {
        $this->jsonData[$offset] = $value;
    }

    /**
     * Offset to unset
     *
     * @link  http://php.net/manual/en/arrayaccess.offsetunset.php
     * @param mixed $offset <p>
     *                      The offset to unset.
     *                      </p>
     * @return void
     * @since 5.0.0
     */
    public function offsetUnset($offset)
    {
        unset($this->jsonData[$offset]);
    }


    /**
     * Get the instance as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return $this->jsonData;
    }
}