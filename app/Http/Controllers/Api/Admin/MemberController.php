<?php
/**
 * Created by PhpStorm.
 * User: zengfanwei
 * Date: 2018/11/7
 * Time: 14:25
 */

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiStatus;
use App\Models\Member;
use Illuminate\Support\Facades\Input;

class MemberController extends BaseController
{
    /**
     * 获取用户列表分页
     */
    public function lists()
    {
        $data = Member::getInstance()->getList(Input::all(),Input::get('pageSize'));

        return $this->success($data);
    }

    public function detail()
    {
        $id = Input::get('id');
        if(!$id){
            return $this->error(ApiStatus::ERR_UNKNOWN,'缺少id');
        }

        $detail = Member::getInstance()->detail($id);
        return $this->success($detail) ;
    }


}