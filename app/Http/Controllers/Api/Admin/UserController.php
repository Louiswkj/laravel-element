<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/5/7
 * Time: 18:41
 */

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;


class UserController extends Controller
{
    public function lists()
    {
        return 'this is lists page';
    }

    public function detail()
    {
        return 'this is detail page';
    }

    /**
     *
     * @is_public Y
     * @op_title 添加
     */
    public function add()
    {
        return 'this is add page';
    }

    public function update()
    {
        return 'this is update page';
    }

    public function del()
    {
        return 'this is del page';
    }
}