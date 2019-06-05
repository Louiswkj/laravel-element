<?php
/**
 * Created by PhpStorm.
 * User: zengfanwei
 * Date: 2018/10/31
 * Time: 14:03
 */

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiStatus;
use App\Models\Group;
use Illuminate\Support\Facades\Input;

class GroupController extends BaseController
{
    /**
     * 获取管理组列表
     */
    public function getList()
    {
        $data = Group::getInstance()->getList(Input::all());

        return $this->success([
            'list' => $data,
        ]);


    }

    /**
     * 保存管理组
     */
    public function save()
    {
        if(!Input::get('id')) {
            $rows = Group::getInstance()->getRows(['title' => Input::get('title')]);
            if(!empty($rows)) {
                return $this->error(ApiStatus::ERR_UNKNOWN,'保存失败');
            }
        }

        Group::getInstance()->saveData(Input::all());

        return $this->success();
    }
}