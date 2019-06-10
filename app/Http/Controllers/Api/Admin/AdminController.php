<?php
/**
 * Created by PhpStorm.
 * User: zengfanwei
 * Date: 2018/11/7
 * Time: 14:25
 */

namespace App\Http\Controllers\Api\Admin;


use App\Components\Common;
use App\Helpers\ApiStatus;
use App\Models\Admin;
use App\Models\SystemLogs;
use Clazz\Typed\Illuminate\Support\Facades\Input;

class AdminController extends BaseController
{

    protected $loginInfo;
    /**
     * 获取用户列表分页
     */
    public function getList()
    {
        $data = Admin::getInstance()->getList(Input::all(),Input::get('pageSize'));

        return $this->success($data);
    }

    /**
     * 获取用户列表分页
     */
    public function getLogs()
    {
        $data = SystemLogs::getInstance()->getList(Input::all(),Input::get(('pageSize')));
        return $this->success($data);
    }

    /**
     * 保存用户
     */
    public function save()
    {
        if(!Input::get('id')) {
            $rows = Admin::getInstance()->getRows(['username' => Input::get('username')]);
            if(!empty($rows)) {
                return $this->error(ApiStatus::ERR_UNKNOWN,'保存失败');
            }
        }

        Admin::getInstance()->saveData(Input::all());

        return $this->success();
    }

    public function uploadAvatar()
    {
        $res = Common::uploadImgToLocalStorage(Input::all(), 'file');
        if($res['error'] !== 0) {
            return $this->error(ApiStatus::ERR_UNKNOWN, $res['msg']);
        }

        return $this->success(['img_path' => $res['img_path']]);
    }

    public function saveAvatar()
    {
        $this->setLoginInfo();
        Admin::getInstance()->saveData([
            'id' => $this->loginInfo['admin_id'],
            'avatar' => Input::get('avatar')
        ]);

        return $this->success();
    }

    public function changePassword()
    {
        $this->setLoginInfo();
        if(!Admin::getInstance()->checkPassword($this->loginInfo['admin_id'], Input::get('old_password'))) {
            return $this->error(ApiStatus::OLD_PASSWORD_WRONG);
        }

        Admin::getInstance()->saveData([
            'id' => $this->loginInfo['admin_id'],
            'password' => Input::get('password')
        ]);

        return $this->success();
    }

    public function getProfile()
    {
        $this->setLoginInfo();
        $rows = Admin::getInstance()->getRows([
            'id' => $this->loginInfo['admin_id'],
        ]);

        return $this->success($rows[0] ?? []);
    }

    public function setLoginInfo()
    {
        $this->loginInfo = session('loginInfo');
    }

    public function delete()
    {
        Admin::getInstance()->deleteRow(Input::get('id'));
        return $this->success();
    }
}