<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/5/7
 * Time: 18:41
 */

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\ApiException;
use App\Helpers\ApiStatus;
use App\Http\Controllers\Controller;


class DefaultController extends Controller
{
    const CONTROLLER_NAMESPACE = 'App\Http\Controllers\Api\Admin';

    /**
     * @param \Illuminate\Http\Request $request
     * @throws ApiException
     * @throws \ReflectionException
     */
    public function run(\Illuminate\Http\Request $request)
    {
        list($controller, $action) = $this->parseControllerActionFromPath($request->getPathInfo());
        $fullController = self::CONTROLLER_NAMESPACE . '\\' . $controller;

        $method = new \ReflectionMethod($fullController, $action);

        $tempObj = new $fullController();
        return call_user_func(array($tempObj, $action));
    }

    /**
     * 根据路径解析出 controller 和 action
     *
     * @param $path
     * @return array($controller, $action)
     * @throws \App\Exceptions\ApiException
     */
    protected function parseControllerActionFromPath($path, $prefix = '/api/')
    {
        $path = str_replace($prefix, '', $path);
        $parts = explode('/', $path, 2);
        $partsLen = count($parts);
        if ($partsLen > 1) {
            $controller = implode(' ', array_slice($parts, 0, $partsLen - 1));
            $action = last($parts);
        } else {
            $controller = $parts[0];
            $action = '';
        }

        // 默认controller处理
        if (!$controller) {
            throw new ApiException(ApiStatus::ERR_INVALID_OPERATION, "Operation not supported." . (env('APP_ENV') === 'production' ? '' : " Controller is missing."));
        }

        // 默认action处理
        if (!$action) {
            throw new ApiException(ApiStatus::ERR_INVALID_OPERATION, "Operation not supported." . (env('APP_ENV') === 'production' ? '' : " Action is missing."));
        }

        // 规范化controller和action
        // product-suite/list => ProductSuiteController/lists
        $controller = ucfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $controller), ' '))) . 'Controller';
        $action = lcfirst(str_replace(' ', '', ucwords(str_replace(['-', '.'], ' ', str_replace('/', ' ', $action)), ' ')));

        // 处理保留字action
        $action = $this->mapReservedAction($action);

        return array($controller, $action);
    }

    /**
     * 一些保留的action需要映射到特殊名字
     * @param $action
     * @return mixed
     */
    protected function mapReservedAction($action)
    {
        static $reserved = [
            'list' => 'lists',
        ];

        if (isset($reserved[$action])) {
            return $reserved[$action];
        }

        $class = new \ReflectionClass('\Illuminate\Routing\Controller');
        if ($class->hasMethod($action)) {
            return $action . '_';
        }

        return $action;
    }
}