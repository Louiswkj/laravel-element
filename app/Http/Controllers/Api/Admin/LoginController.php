<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/5/7
 * Time: 18:41
 */

namespace App\Http\Controllers\Api\Admin;

use App\Components\Common;
use App\Helpers\ApiStatus;
use App\Models\Admin;
use App\Models\Rule;
use Clazz\Typed\Types\Type;
use Clazz\Typed\Illuminate\Support\Facades\Input;

class LoginController extends BaseController
{
    /**
     * @return array
     * 登录接口
     */
    public function login()
    {
        $adminModel = new Admin();
        $username =   Input::getSanitized(
            'username' , Type::string()->trim()->desc('用户名')
        );
        $userInfo = $adminModel->where('username',$username)->first();

        if(empty($userInfo)) {
            return $this->error(ApiStatus::ERR_LOGIN_ERROR);
        }

        if(time() - $userInfo['last_login'] < 3600 && $userInfo['try_time'] > 5) {
            return $this->error(ApiStatus::ERR_LOGIN_TRY_ERROR);
        }

        $checkPass = $adminModel->checkPassword($userInfo['id'], Input::get('password'));

        if(!$checkPass) {
            $adminModel->saveData([
                'id' => $userInfo['id'],
                'try_time' => $userInfo['try_time'] + 1
            ]);

            return $this->error(ApiStatus::ERR_LOGIN_ERROR);
        }

        $userInfo = $this->loginSuccess($userInfo);
        return $this->success($userInfo);
    }

    private function loginSuccess($userInfo)
    {
        $request = app('request');
        Admin::getInstance()->saveData([
            'id'         => $userInfo['id'],
            'try_time'   => 0,
            'last_login' => microtime(true),
            'last_ip'    => $request->getClientIp()
        ]);

        $rules = Rule::getInstance()->getRulesByUID($userInfo['id']);
        $request->session()->put('loginInfo', [
            'admin_id' => $userInfo['id'],
            'username' => $userInfo['username'],
            'rules'    => $rules,
        ]);

        $menus = [];
        $list = Rule::getInstance()->getList(['menu' => 1, 'status' => 1]);
        foreach ($list as $row) {
            if(in_array($row['name'], $rules)) {
                $menus[] = $row;
            }
        }

        $userInfo['menus'] = Common::generateRuleTree($menus, 0);

        return $userInfo;
    }

    /**
     * 登出
     * @return $this|\Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $request = app('request');
        $request->session()->forget('loginInfo');
        return $this->success();
    }
}