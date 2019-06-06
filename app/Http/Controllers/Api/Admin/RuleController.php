<?php
/**
 * Created by PhpStorm.
 * User: zengfanwei
 * Date: 2018/11/5
 * Time: 11:01
 */

namespace App\Http\Controllers\Api\Admin;


use App\Components\Common;
use App\Helpers\ApiStatus;
use App\Models\Rule;
use Illuminate\Support\Facades\Input;

class RuleController extends BaseController
{
    public function getTreeList()
    {
        $list = Rule::getInstance()->getList(Input::all());
        $tree = Common::generateRuleTree($list, 0);

        return $this->success([
            'list' => $tree,
        ]);
    }

    public function getAllRoutes()
    {
        $routes = app()->routes->getRoutes();
        $data = [];
        foreach ($routes as $value) {
            if(!$value->uri || $value->uri === '/') {
                continue;
            }
            $data[] = $value->uri;
        }

        return $this->success($data);
    }

    /**
     * 保存权限
     */
    public function save()
    {
        if(!Input::get('id')) {
            $rows = Rule::getInstance()->getRows(['name' => Input::get('name')]);
            if(!empty($rows)) {
                return $this->error(ApiStatus::ERR_UNKNOWN);
            }
        }

        Rule::getInstance()->saveData(array_except(Input::all(),'_token'));

        return $this->success();
    }

    /**
     * 获取详情
     * @return $this|\Illuminate\Http\JsonResponse
     */
    public function get()
    {
        $rows = Rule::getInstance()->getRows(['id' => Input::get('id')]);
        return $this->success($rows[0] ?? []);
    }

    /**
     * 获取路径详情
     */
    public function getPathInfo()
    {
        $path = Input::get('path');
        $list = Rule::getInstance()->getList();

        $newList = $curRow = [];
        foreach ($list as $row) {
            $newList[$row['id']] = $row;
            if($path === $row['name']) {
                $curRow = $row;
            }
        }
        if(empty($curRow)) {
            return $this->error(ApiStatus::ERR_UNKNOWN);
        }

        $data[] = $curRow;
        while (isset($newList[$curRow['pid']])) {
            array_push($data, $newList[$curRow['pid']]);
            $curRow = $newList[$curRow['pid']];
        }

        $data = array_reverse($data);

        return $this->success($data);
    }

    /**
     * 删除记录
     */
    public function delete()
    {
        Rule::getInstance()->deleteRow(Input::get('id'));
        return $this->success();
    }

}